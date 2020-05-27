<html>
<h1 align="center">GoBarber Restful Application</h1>
<p align="center" >

<img src="https://img.shields.io/badge/language-typescript-blue.svg" />
<a href="https://codecov.io/gh/nelsonatgithub/gobarber-node"><img src="https://img.shields.io/codecov/c/github/nelsonatgithub/gobarber-node/dev.svg" /></a>
<a href="https://stats.uptimerobot.com/Wj6Alhjy9q/785050959"><img src="https://img.shields.io/uptimerobot/status/m785050959-a43c5e69985219f6805d7f57.svg" /></a>
<a href="https://stats.uptimerobot.com/Wj6Alhjy9q/785050959"><img src="https://img.shields.io/uptimerobot/ratio/7/m785050959-a43c5e69985219f6805d7f57.svg" /></a>
<a href="https://observatory.mozilla.org/analyze/quiet-fjord-56939.herokuapp.com"><img src="https://img.shields.io/mozilla-observatory/grade-score/quiet-fjord-56939.herokuapp.com?publish.svg" /></a>

</p>
</html>

> em desenvolvimento

# Descrição

Esse repositório implementa uma Restful API para prover full-Backend ao projeto GoBarber. É um *monoliton* on NodeJS, Express, Typeorm, Sendgrid, Tsyringe, ... *até então*. Esse trabalho é resultado do aprendizado no Bootcamp GoStack da Rocketseat.

> O GoBarber é uma aplicação que agenda serviços de barbearia entre clientes e donos de barbearia. Donos de lojas anunciam serviços definindo seus horários disponíveis. Clientes escolhem serviços e horários.

O projeto está sendo implementado em arquitetura baseada em camadas:

   - Camada de acesso a dados
   - Camada de serviços
   - Camada de rede

A `camada de acesso` depende principalmente do [Typeorm](https://typeorm.io). O repo implementa migrations, models e custom repositories.

A `camada de serviços` implementa a lógica de negócios do projeto. Ela acessa dados por meio dos repositories e ativa serviços secundários, como o [SendGrid](https://sendgrid.com).

A `camada de rede` implementa a interface HTTP com [Express](https://expressjs.com). A autenticação é feita por [JWT](https://www.npmjs.com/package/jsonwebtoken).

O [Tsyringe](https://github.com/microsoft/tsyringe) é usado para prover as dependências entre camadas de rede e serviços, e entre camadas de serviços e acesso. *Camada de rede não acessa camada de acesso a dados diretamente*.

# Features

    1. Barbershop Services
        Vários serviços por barbearia (ex: cabelo, barba, manicure, etc.)

    2. Appointment by Service
        Agendamentos são atrelados a serviços, porque a loja pode prover mais de um serviço e serviços diferentes no mesmo horário.

    3. Messages for Appointments
        Cliente e Barbeiros conversam sobre o agendamento


# Executando o Projeto

## 1) Dependências

O projeto é desenvolvido em Linux. O aplicativo é feito no Node e usa Docker para emular algumas dependências externas.

Para instalar o Node, recomendo os scripts do [NodeSource](https://github.com/nodesource/distributions#installation-instructions): curl no arquivo de setup, pipe para bash e `apt install`

Para instalar o Docker, recomendo as [documentações oficiais](https://docs.docker.com/get-docker/): GPG key, `add-apt-repository` e `apt install`.

É suficiente ter as versões estáveis para desenvolvimento. *Não recomendo versões beta, alpha ou nightly.*

```bash
# Versão do Docker
> docker --version
Docker version 19.03.8, build afacb8b7f0

# Versão do Node
> node --version
v13.14.0

# Versão do Npm
> npm --version
6.14.5

# Atualização as dependências do repositório
> npm install
```

## 1) Banco de dados

O banco de dados deve ser configurado com o servidor Postgres ou com uma imagem do Postgres no Docker.

Tendo o servidor Postgres ativo, crie um banco de dados com o nome `gobarber` e `gobarber_test`. E configure o arquivo `ormconfig.json` com usuário e senha acessíveis ao node.

```bash
# Iniciar o postgres server
> sudo systemctl start postgresql # caso inactive

# Criar bancos de dados
> psql [CONNECTION_STRING] -c 'create database gobarber;'
> psql [CONNECTION_STRING] -c 'create database gobarber_test;'
```

Alternativamente, com o Docker instalado, inicie o container com imagem do Postgres e crie os bancos de dados.

```bash
# Iniciar o docker com a image do Postgres
> docker run --rm -e POSTGRES_PASSWORD=postgresdocker -p 5432:5432 --name docker-postgres -d postgres

# Crie os bancos de dados
> docker run -it --rm --network container:docker-postgres postgres psql -h localhost -U postgres -c 'create database gobarber;'
> docker run -it --rm --network container:docker-postgres postgres psql -h localhost -U postgres -c 'create database gobarber_test;'
```

Ou ainda, tendo o Docker, execute o script.

```bash
> npm run docker:init
```

## 2) Servidor de Applicação

```bash
# Servir a aplicação
> npm run dev:server
```

## 3) Testando a aplicação

```bash
# Testando arquivos separados
> jest [PATH_TO_TEST_FILE]

# Executar todos testes
> npm run test

# Executar tests Unitários
> npm run test:unit

# Executar tests Integrados
> npm run test:integration
```

O script `test:unit` executa todos testes unitários paralelamente e gera *code coverage* dos testes unitários.

O script `test:integration` executa todos testes integrados sequencialmente e gera *code coverage* dos testes integrados.

o script `test` limpa o cache do jest e executa todos testes (unitários e integrados) sequencialmente e gera *code coverage* de todos testes em cima de todo o código do projeto.
