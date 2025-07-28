# Instruções de Configuração (Supabase e Vercel)

Parabéns! A estrutura inicial do seu novo projeto foi criada com sucesso usando Vite, React e TypeScript.

Siga os passos abaixo para conectar seu banco de dados Supabase e fazer o deploy na Vercel.

## Passo 1: Configurar as Variáveis de Ambiente

Para que sua aplicação se conecte ao Supabase de forma segura, sem expor suas chaves no código, usamos variáveis de ambiente.

1.  **Crie um arquivo `.env`:**
    *   Na pasta principal do projeto (`inventario-depto-instalacoes`), crie um novo arquivo chamado `.env`.

2.  **Adicione suas chaves do Supabase:**
    *   Abra o arquivo `.env` e adicione as seguintes linhas, substituindo `SUA_URL` e `SUA_CHAVE_ANON` pelas credenciais do seu projeto no Supabase:

    ```
    VITE_SUPABASE_URL=SUA_URL
    VITE_SUPABASE_ANON_KEY=SUA_CHAVE_ANON
    ```

    *   **Importante:** O prefixo `VITE_` é necessário para que o Vite exponha essas variáveis para a sua aplicação.

3.  **Segurança:**
    *   O arquivo `.gitignore` já está configurado para ignorar o arquivo `.env`. Isso garante que suas chaves secretas **nunca** sejam enviadas para o repositório do GitHub.

## Passo 2: Fazer o Deploy na Vercel

1.  **Crie uma conta na Vercel:**
    *   Acesse [vercel.com](https://vercel.com) e crie uma conta (você pode usar sua conta do GitHub para facilitar).

2.  **Importe seu Projeto:**
    *   No seu dashboard da Vercel, clique em "Add New..." -> "Project".
    *   Selecione o repositório `inventario-depto-instalacoes` que você clonou no GitHub.

3.  **Configure as Variáveis de Ambiente na Vercel:**
    *   Durante o processo de importação, a Vercel vai detectar que é um projeto Vite e pré-configurar a maioria das coisas para você.
    *   Vá para a seção "Environment Variables" (Variáveis de Ambiente).
    *   Adicione as **mesmas** duas variáveis que você colocou no seu arquivo `.env`:
        *   `VITE_SUPABASE_URL` com a sua URL do Supabase.
        *   `VITE_SUPABASE_ANON_KEY` com a sua Chave Anon do Supabase.

4.  **Faça o Deploy:**
    *   Clique no botão "Deploy". A Vercel irá construir seu projeto e colocá-lo online.

## Próximos Passos no Código

Agora que a estrutura está pronta, os próximos passos no nosso plano de refatoração serão:

*   **Fase 2:** Quebrar o `index.html` original em componentes React.
*   **Fase 3:** Estilizar os componentes e finalizar a aplicação.

A cada `git push` que fizermos para o GitHub, a Vercel automaticamente fará um novo deploy com as atualizações.
