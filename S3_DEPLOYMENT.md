# Configuração do S3 + CloudFront para Hospedagem da Aplicação React

## Problema Identificado
A aplicação fica em branco no S3 porque usa React Router com BrowserRouter, que requer configuração especial para hospedagem estática.

## Soluções Implementadas

### 1. Configurações do Vite
- ✅ Adicionado `base: './'` no vite.config.ts para caminhos relativos
- ✅ Configurado rollupOptions para otimizar o build
- ✅ Criado arquivo `_redirects` para fallback de rotas

### 2. Configuração Recomendada: Bucket S3 Privado + CloudFront

**Esta é a configuração mais segura e recomendada para produção.**

#### Passo 1: Configurar Bucket S3 (Privado)
1. Acesse o console da AWS S3
2. Crie ou selecione seu bucket
3. **Mantenha o bucket privado** (não habilite hospedagem estática)
4. Em "Permissions" > "Block public access", mantenha todas as opções marcadas

#### Passo 2: Criar Policy para CloudFront
Em "Permissions" > "Bucket policy", adicione:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "AllowCloudFrontServicePrincipal",
            "Effect": "Allow",
            "Principal": {
                "Service": "cloudfront.amazonaws.com"
            },
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::SEU-BUCKET-NAME/*",
            "Condition": {
                "StringEquals": {
                    "AWS:SourceArn": "arn:aws:cloudfront::SUA-CONTA-ID:distribution/SUA-DISTRIBUTION-ID"
                }
            }
        }
    ]
}
```

**Substitua:**
- `SEU-BUCKET-NAME` pelo nome real do seu bucket
- `SUA-CONTA-ID` pelo ID da sua conta AWS
- `SUA-DISTRIBUTION-ID` pelo ID da distribuição CloudFront

#### Passo 3: Configurar CloudFront
1. Acesse o console do CloudFront
2. Crie uma nova distribuição
3. Configure o Origin:
   - **Origin Domain**: Selecione seu bucket S3
   - **Origin Access**: Origin Access Control (OAC)
   - Crie um novo OAC se necessário
4. Configure Default Cache Behavior:
   - **Viewer Protocol Policy**: Redirect HTTP to HTTPS
   - **Allowed HTTP Methods**: GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE
5. Configure Custom Error Pages:
   - **Error Code**: 403
   - **Response Page Path**: `/index.html`
   - **Response Code**: 200
   - **Error Code**: 404
   - **Response Page Path**: `/index.html`
   - **Response Code**: 200

#### Passo 4: Upload dos Arquivos
1. Execute `npm run build` ou `pnpm build`
2. Faça upload de todos os arquivos da pasta `dist/` para o bucket
3. Mantenha a estrutura de pastas

## Comandos para Deploy

```bash
# Build da aplicação
npm run build
# ou
pnpm build

# Sync com S3 (usando AWS CLI)
aws s3 sync dist/ s3://seu-bucket-name --delete

# Invalidar cache do CloudFront (obrigatório para ver mudanças)
aws cloudfront create-invalidation --distribution-id SEU-DISTRIBUTION-ID --paths "/*"
```

## Verificação
Após configurar:
1. **Acesse a URL do CloudFront** (não a URL do S3)
2. Teste navegação entre rotas
3. Recarregue a página em uma rota específica (ex: `/other`)
4. Verifique se não há erros 404
5. Confirme que o HTTPS está funcionando

## Por que essa configuração resolve o problema?

1. **Bucket Privado**: Maior segurança, acesso controlado apenas pelo CloudFront
2. **Custom Error Pages**: Redireciona 403/404 para `index.html`, permitindo que o React Router funcione
3. **HTTPS**: Protocolo seguro obrigatório para aplicações modernas
4. **Cache Global**: Melhor performance com CDN da AWS
5. **Origin Access Control**: Controle granular de acesso ao S3

## Troubleshooting

### Página ainda em branco?
- Verifique se as Custom Error Pages estão configuradas no CloudFront
- Confirme que todos os arquivos foram enviados corretamente para o S3
- Verifique o console do navegador para erros
- Teste acessando diretamente pelo CloudFront (não pelo S3)

### Erro 403/404 em rotas?
- Confirme a configuração das Custom Error Pages no CloudFront
- Verifique se o arquivo `_redirects` foi incluído no build
- Aguarde a propagação do CloudFront (pode levar até 15 minutos)

### Assets não carregam?
- Verifique se o `base: './'` está no vite.config.ts
- Confirme que os caminhos dos assets estão relativos
- Invalide o cache do CloudFront após mudanças

### Mudanças não aparecem?
- Sempre invalide o cache do CloudFront após deploy
- Aguarde a propagação (pode levar alguns minutos)
- Teste em modo incógnito para evitar cache do navegador