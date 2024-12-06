# Déploiement de l'API LinkUp sur Azure

Ce guide explique étape par étape comment déployer l'API LinkUp sur Azure, la connecter à une base de données Cosmos DB et un compte de stockage Blob Storage, et configurer un déploiement continu avec GitHub.

---

## Prérequis

Avant de commencer, assurez-vous d'avoir :

- Un **compte Azure** actif.
- Un **repository GitHub** avec le code source de l'API.

---

## Étapes de déploiement

### 1. Création d'une Web App (App Service)

1. Connectez-vous au **Portail Azure** ([https://portal.azure.com](https://portal.azure.com)).
2. Recherchez **Web App** dans la barre de recherche, puis cliquez sur le résultat correspondant dans la Marketplace.
3. Remplissez les champs requis :
   - **Nom de l'application** : `linkupLNB`.
   - **Groupe de ressources** : `LinkUp`.
   - **Publier** : `Code`.
   - **Pile d'exécution** : `Node.js 20 LTS`.
   - **Système d'exploitation** : `Linux`.
4. Cliquez sur **Suivant : Déploiement**.
5. Activez l'option **Déploiement continu**.
6. Renseignez les informations liées à votre repository GitHub :
   - **Compte GitHub**.
   - **Organisation**.
   - **Dépôt**.
   - **Branche**.
7. Cliquez sur **Vérifier + Créer**, puis sur **Créer** pour déployer l'API.

---

### 2. Configuration de Cosmos DB

1. Accédez à **Azure Cosmos DB** dans le portail Azure et cliquez sur **+ Ajouter**.
2. Sélectionnez l'API **Core (SQL)**.
3. Remplissez les champs suivants :
   - **Nom de l'instance** : `linkup-server`.
   - **Groupe de ressources** : `LinkUp`.
   - **Région** : `France central`
4. Une fois Cosmos DB créé, allez dans l'onglet **Clés** pour récupérer la **chaîne de connexion** et les informations nécessaires pour l'utiliser dans l'API ou l'ajouter dans les variables d'environnements de la Web App.

---

### 3. Configuration du stockage Azure Blob

1. Accédez à **Comptes de stockage** dans le portail Azure et cliquez sur **+ Ajouter**.
2. Remplissez les champs suivants :
   - **Nom du compte de stockage** : `linkuplnbstorage`.
   - **Performance** : `Standard`.
   - **Redondance** : `LRS (Local Redundant Storage)`.
3. Une fois le compte créé, allez dans l'onglet **Conteneurs**, puis ajoutez un nouveau conteneur nommé `media`.
4. Récupérez la clé d'accès et la chaîne de connexion pour l'utiliser dans l'API ou l'ajouter dans les variables d'environnements de la Web App.

---

### 4. Configuration des variables d'environnement

1. Retournez dans votre **App Service**.
2. Allez dans **Paramètres > Configurations > Variables d'application**.
3. Ajoutez les variables suivantes :
   - `COSMOS_URI` : `https://linkup-server.documents.azure.com:443/`
   - `COSMOS_KEY` : `<votre_clé_Cosmos_DB>`
   - `JWT_SECRET` : `a8!2@dE#l$F3%q9^k&Cw*Jz_Py-Lx+Vm4(7~R`
   - `AZURE_STORAGE_CONNECTION_STRING` : `<votre_chaine_de_connexion_blob_storage>`
4. Enregistrez les modifications et redémarrez votre App Service.

---

## Vérification

1. Accédez à l'URL publique de votre API :  
   `https://linkuplnb-hwcfg6bygacdh3dm.francecentral-01.azurewebsites.net`
2. Testez les routes de votre API avec un outil comme **Postman** ou **Insomnia**.

---

**Auteur** : Noah LOUIS / Benjamin MAURY / Léonard TREVE
