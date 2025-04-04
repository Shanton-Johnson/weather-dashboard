require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { Pool } = require("pg");

const app = express();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.use(cors());
app.use(express.json());

// Fetch weather data from API
app.get("/weather/:city", async (req, res) => {
    const { city } = req.params;
    try {
        const weatherResponse = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${process.env.WEATHER_API_KEY}&units=metric`
        );

        const { temp, humidity } = weatherResponse.data.main;
        const condition = weatherResponse.data.weather[0].description;
        const wind_speed = weatherResponse.data.wind.speed;

        // Store in PostgreSQL
        await pool.query(
            "INSERT INTO weather_data (city, temperature, condition, humidity, wind_speed) VALUES ($1, $2, $3, $4, $5)",
            [city, temp, condition, humidity, wind_speed]
        );

        res.json({ city, temp, condition, humidity, wind_speed });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch weather data" });
    }
});

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});
