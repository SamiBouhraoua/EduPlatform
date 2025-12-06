# Utilise Node.js 18
FROM node:18

# Définit le dossier de travail
WORKDIR /app

# Copie les fichiers de dépendances
COPY package*.json ./

# Installe les dépendances
RUN npm install

# Copie le reste du code
COPY . .

# Expose le port correspondant
EXPOSE 4000

# Lance le service (server.js)
CMD ["node", "server.js"]
