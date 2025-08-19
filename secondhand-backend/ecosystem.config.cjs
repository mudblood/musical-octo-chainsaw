module.exports = {
  apps: [
    {
      name: "secondhand-backend",
      script: "index.js",  // must match your entry file
      cwd: "/root/musical-octo-chainsaw/secondhand-backend",
      watch: false,
      env: {
        OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      },
    },
  ],
};
