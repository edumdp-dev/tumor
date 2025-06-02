# Predição de Estágio de Tumor Cerebral

Este projeto é uma aplicação web desenvolvida para auxiliar na predição do estágio de tumores cerebrais. Utilizando um modelo de Machine Learning, a ferramenta analisa dados do paciente e características do tumor para fornecer uma estimativa do estágio tumoral.

## Modelo Preditivo

O sistema utiliza um modelo de classificação **Naive Bayes Gaussiano**. Este modelo foi treinado com um conjunto de dados abrangente que inclui as seguintes informações:

*   `Age` (Idade)
*   `Gender` (Gênero)
*   `Tumor_Type` (Tipo de Tumor)
*   `Tumor_Size` (Tamanho do Tumor em cm)
*   `Location` (Localização do Tumor)
*   `Histology` (Histologia)
*   `Symptom_1` (Sintoma Principal)
*   `Symptom_2` (Sintoma Secundário)
*   `Symptom_3` (Sintoma Terciário)
*   `Radiation_Treatment` (Tratamento com Radiação)
*   `Surgery_Performed` (Cirurgia Realizada)
*   `Chemotherapy` (Quimioterapia)
*   `Survival_Rate` (Taxa de Sobrevida Estimada em %)
*   `Tumor_Growth_Rate` (Taxa de Crescimento do Tumor em cm³/mês ou %/mês)
*   `Family_History` (Histórico Familiar de Tumor Cerebral)
*   `MRI_Result` (Resultado da Ressonância Magnética)
*   `Follow_Up_Required` (Acompanhamento Necessário)
*   `Treatment_Response` (Resposta ao Tratamento Inicial)

O modelo e o LabelEncoder para a variável alvo são carregados a partir do arquivo `gnb_assinado.pkl`.

## Como Executar a Aplicação

Para executar esta aplicação localmente, siga os passos abaixo:

1.  **Clone o repositório:**
    ```bash
    git clone <URL_DO_REPOSITORIO>
    cd <NOME_DA_PASTA_DO_PROJETO>
    ```
2.  **Crie e ative um ambiente virtual (recomendado):**
    ```bash
    python -m venv venv
    # No Windows
    venv\Scripts\activate
    # No macOS/Linux
    source venv/bin/activate
    ```
3.  **Instale as dependências:**
    É necessário ter o Python 3 instalado. As principais bibliotecas utilizadas são Flask, Pandas e Scikit-learn. Você pode instalá-las com:
    ```bash
    pip install Flask pandas scikit-learn
    ```
4.  **Execute a aplicação:**
    ```bash
    python app.py
    ```
    A aplicação estará disponível em `http://localhost:5000`.

## API de Predição

A aplicação expõe um endpoint para predições:

*   **URL:** `/predict`
*   **Método:** `POST`
*   **Formato do Corpo da Requisição:** JSON

    O JSON deve conter chaves correspondentes às colunas listadas na seção "Modelo Preditivo". Valores numéricos devem ser enviados como números, e textuais como strings. Campos opcionais ou não preenchidos podem ser enviados como `null`, uma string vazia (`""`) ou a string `"N/A"`.

    **Exemplo de corpo da requisição:**
    ```json
    {
        "Age": 55,
        "Gender": "Male",
        "Tumor_Type": "Malignant",
        "Tumor_Size": 3.5,
        "Location": "Frontal Lobe",
        "Histology": "Glioblastoma",
        "Symptom_1": "Headache",
        "Symptom_2": "N/A",
        "Symptom_3": "N/A",
        "Radiation_Treatment": "Yes",
        "Surgery_Performed": "Yes",
        "Chemotherapy": "No",
        "Survival_Rate": 75.5,
        "Tumor_Growth_Rate": 0.2,
        "Family_History": "No",
        "MRI_Result": "Positive",
        "Follow_Up_Required": "Yes",
        "Treatment_Response": "Stable"
    }
    ```
*   **Formato da Resposta (Sucesso):** JSON
    ```json
    {
        "stage_predito": "Estágio X"
    }
    ```
*   **Formato da Resposta (Erro):** JSON
    ```json
    {
        "error": "Mensagem de erro detalhada."
    }
    ```

## Equipe de Desenvolvimento

Este projeto foi desenvolvido por:

*   Edu
*   Kenzo
*   Fujita

## Aviso Importante

<i class="fas fa-info-circle"></i> Esta predição é uma ferramenta de auxílio baseada em Machine Learning/Inteligência Artificial. **Não deve ser considerada um diagnóstico médico definitivo.** Sempre consulte um profissional de saúde qualificado para avaliações médicas e diagnósticos.
