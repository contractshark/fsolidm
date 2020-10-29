# ContractShark webFSM

## FSolidM

> Correct-by-Design Smart Contracts - The FSolidM / VeriSolid framework

This repository contains a fork of the implementation of the FSolidM / VeriSolid framework, which allows designing and generating secure Solidity smart contracts. FSolidM / VeriSolid is built on [WebGME](http://github.com/webgme/webgme). 

An original version is available of FSolidM is available online on [CPS-VO](http://cps-vo.org/group/SmartContracts) for non-commercial and academic use.



## Install 

### Requirements

```bash
sudo apt-get install \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg-agent \
    software-properties-common

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.36.0/install.sh | bash
source ~/.bashrc
sudo apt update
nvm install 10

sudo apt install mongodb-clients
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu bionic/mongodb-org/4.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.4.list
sudo apt-get update

wget -qO - https://www.mongodb.org/static/pgp/server-4.4.asc | sudo apt-key add -
sudo apt-get install -y mongodb-org

ps --no-headers -o comm 1

npm i -g bower 
npm i -g pm2
```


## Features

* Collaborative, automatically versioned web-based development.

![Project history view with branching and tagging](../img/S1.png)

* Dedicated Transition System Editors. In the upper left corner you can see the plugins offered by the tool for: 1) adding functionality through design patterns; 2) generating Solidity code and 3) verifying smart contracts.

![TS model editors](../img/S2.png)

* Fully integrated Solidity code development.

![Solidity development](../img/S3.png)

* Templates for writing security properties in natural language when running the VerifyContract plugin. If no property is specified the tool still verifies deadlock-freedom. 

![Safety properties](../img/S4.png)

* The verification results are returned to the user. If a security property is not true, FSolidM returns a counter-example that invalidates the property.

![Verification](../img/S5.png)

* Embeddable documentation at every level of the model.

