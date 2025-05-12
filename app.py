import pickle
import hmac
import hashlib
import pandas as pd
from flask import Flask, request, jsonify, render_template
from sklearn.preprocessing import LabelEncoder

CHAVE_SECRETA_GS = b'gnb'
NOME_ARQUIVO_MODELO = 'construção api/gnb_assinado.pkl' 

pipeline_modelo = None
label_encoder_target = None

def deserializar_verificar(chave, arquivo_entrada_path):
    try:
        with open(arquivo_entrada_path, 'rb') as f:
            dados_assinados = f.read()
        obj_serializado = dados_assinados[:-32]
        assinatura_recebida = dados_assinados[-32:]
        assinatura_calculada = hmac.new(chave, obj_serializado, hashlib.sha256).digest()
        if not hmac.compare_digest(assinatura_recebida, assinatura_calculada):
            raise ValueError("Assinatura inválida!")
        objeto = pickle.loads(obj_serializado)
        return objeto
    except FileNotFoundError:
        print(f"Erro: Arquivo do modelo '{arquivo_entrada_path}' não encontrado.")
        raise
    except Exception as e:
        print(f"Erro na desserialização: {e}")
        raise

def carregar_modelo_e_preprocessadores():
    global pipeline_modelo, label_encoder_target
    try:
        dados_carregados = deserializar_verificar(CHAVE_SECRETA_GS, NOME_ARQUIVO_MODELO)
        pipeline_modelo = dados_carregados['melhor_pipeline_gnb_pca']
        label_encoder_target = dados_carregados['label_encoder']
        if not hasattr(label_encoder_target, 'inverse_transform'):
            raise TypeError("LabelEncoder inválido.")
        print("Modelo e LabelEncoder carregados.")
        print(f"Classes do LabelEncoder: {list(label_encoder_target.classes_)}")
    except Exception as e:
        print(f"Falha crítica ao carregar modelo: {e}")
        pipeline_modelo = None
        label_encoder_target = None

carregar_modelo_e_preprocessadores()

app = Flask(__name__, static_folder='static')

COLUNAS_MODELO = [
    'Age', 'Gender', 'Tumor_Type', 'Tumor_Size', 'Location', 'Histology',
    'Symptom_1', 'Symptom_2', 'Symptom_3', 'Radiation_Treatment',
    'Surgery_Performed', 'Chemotherapy', 'Survival_Rate',
    'Tumor_Growth_Rate', 'Family_History', 'MRI_Result',
    'Follow_Up_Required', 'Treatment_Response'
]

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    global pipeline_modelo, label_encoder_target

    if pipeline_modelo is None or label_encoder_target is None:
        return jsonify({'error': 'Modelo preditivo não operacional. Contate o suporte.'}), 503

    try:
        data = request.get_json()
        input_features = {}
        for col in COLUNAS_MODELO:
            value = data.get(col)
            if value is None or str(value).strip() == "" or str(value).upper() == "N/A":
                input_features[col] = pd.NA 
            elif col in ['Age', 'Tumor_Size', 'Survival_Rate', 'Tumor_Growth_Rate']:
                try:
                    input_features[col] = float(value)
                except ValueError:
                    return jsonify({'error': f'Valor inválido para {col}: "{value}". Esperado um número.'}), 400
            else:
                input_features[col] = str(value)
        
        input_df = pd.DataFrame([input_features], columns=COLUNAS_MODELO)
        
        try:
            predicao_codificada = pipeline_modelo.predict(input_df)
        except Exception as e_pipeline:
            print(f"Erro no pipeline: {e_pipeline}")
            return jsonify({'error': f'Erro ao processar dados: verifique os valores (ex: "{str(e_pipeline)}"). Pode ser um valor não esperado para um campo.'}), 400
        
        predicao_final = label_encoder_target.inverse_transform(predicao_codificada)
        return jsonify({'stage_predito': predicao_final[0]})

    except ValueError as ve:
        print(f"Erro de valor: {ve}")
        return jsonify({'error': f'Erro nos dados de entrada: {str(ve)}'}), 400
    except Exception as e:
        print(f"Erro geral: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Erro interno do servidor ao processar a predição.'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)