<html>
<h1 align="center">GoBarber Restful Application</h1>
<p align="center" >

<img src="https://img.shields.io/badge/language-javascript-blue.svg" />


</p>
</html>

> em desenvolvimento

# Descrição

Esse repositório implementa uma Restful API para prover full-Backend ao projeto GoBarber. É um *monoliton* on NodeJS, Express, Typeorm, Sendgrid, Tsyringe, ... *até então*.

---
| O GoBarber é uma aplicação que agenda serviços de barbearia entre clientes e donos de barbearia. Donos de lojas anunciam serviços definindo seus horários disponíveis. Clientes escolhem serviços e horários. |
--
O projeto está sendo implementado em arquitetura baseada em camadas:

   - Camada de acesso a dados
   - Camada de serviços
   - Camada de rede

A `camada de acesso` depende principalmente do [Typeorm](https://typeorm.io). O repo implementa migrations, models e custom repositories.

A `camada de serviços` implementa a lógica de negócios do projeto. Ela acessa dados por meio dos repositories e ativa serviços secundários, como o SendGrid.

A `camada de rede` implementa a interface HTTP com express. A autenticação é feita por JWT.

O [Tsyringe](https://github.com/microsoft/tsyringe) é usado para prover as dependências entre camadas de rede e serviços, e entre camadas de serviços e acesso. *Camada de rede não acessa camada de acesso a dados diretamente*.

# Features

    1. Barbershop Services
        Vários serviços por barbearia (ex: cabelo, barba, manicure, etc.)

    2. Appointment by Service
        Cliente agenda um serviço e pode alterar o serviço

    3. Messages for Appointments
        Cliente e Barbeiros conversam sobre o agendamento


# Executando o Projeto

## 1) Banco de dados

O banco de dados deve ser configurado com o servidor Postgres ou com uma imagem do Postgres no Docker.

Tendo o servidor Postgres ativo, crie um banco de dados com o nome `gobarber` e `gobarber_test`. E configure o arquivo `ormconfig.json` com usuário e senha a serem usados pelo Node.

```bash
# No Linux
> sudo systemctl start postgresql # caso inactive

# Na command line, execute o seguinte.
> psql [CONNECTION_STRING] -c 'create database gobarber;'
> psql [CONNECTION_STRING] -c 'create database gobarber_test;'
```

Ou tendo o Docker instalado, inicie o container com imagem do Postgres e crie os bancos de dados.

```bash
# Iniciar o docker com a image do Postgres
> docker run --rm -e POSTGRES_PASSWORD=postgresdocker -p 5432:5432 --name docker-postgres -d postgres

# Crie os bancos de dados
> docker run -it --rm --network container:docker-postgres postgres psql -h localhost -U postgres -c 'create database gobarber;'
> docker run -it --rm --network container:docker-postgres postgres psql -h localhost -U postgres -c 'create database gobarber_test;'
```

## 2) Servidor de Applicação

```bash
# Instalar dependências do projeto
> npm install

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

O script `test:unit` executa todos testes unitários paralelamente e gera *code coverage* apenas dos testes unitários.

O script `test:integration` executa todos testes integrados sequencialmente e gera *code coverage* apenas dos testes integrados.

o script `test` limpa o cache do jest e executa todos testes (unitários e integrados) sequencialmente e gera *code coverage* de todos testes em cima do código do projeto todo.
