const express = require("express")
const router = express.Router()
const Unit = require("../models/unitModel")
const { ObjectId } = require('mongodb');


router.post("/connect-unit", (req, res) => {
    const unit = new Unit(req.body)
  
    console.log(unit)
    unit
      .save()
      .then((result) => {
        res.send(result)
      })
      .catch((err) => {
        res.status(400)
        console.log(err)
      })
    res.status(200)
})

router.post("/update-data", (req, res) => {

  const time = new Date()
    const soilMoistureReading = {
      reading: req.body.soilMoisture,
      time: time
    }

    const humidityReading = {
      reading: req.body.humidity,
      time: time
    }

    const temperatureReading = {
      reading: req.body.temperature,
      time: time
    }

    const lightIntensityReading = {
      reading: req.body.lightIntensity,
      time: time
    }

    // console.log(pastReading)
  
    Unit.updateOne(
      { moduleID: req.body.moduleID },
      {
        updatedAt: time,
        
        //soil moisture
        "soilMoistureSensor.lastReading": req.body.soilMoisture,
        "soilMoistureSensor.lastUpdatedTime": time,
        // $push: { "soilMoistureSensor.pastReadings": soilMoistureReading },
        
        // temperature
        "temperatureSensor.lastReading": req.body.temperature,
        "temperatureSensor.lastUpdatedTime": time,
        // $push: { "temperatureSensor.pastReadings": temperatureReading },
        
        // light intensity
        "lightIntensitySensor.lastReading": req.body.lightIntensity,
        "lightIntensitySensor.lastUpdatedTime": time,
        // $push: { "lightIntensitySensor.pastReadings": lightIntensityReading },
        
        // humidity
        "humiditySensor.lastReading": req.body.humidity,
        "humiditySensor.lastUpdatedTime": time,

        // past readings
        $push: { 
          "soilMoistureSensor.pastReadings": soilMoistureReading,
          "temperatureSensor.pastReadings": temperatureReading,
          "lightIntensitySensor.pastReadings": lightIntensityReading,
          "humiditySensor.pastReadings": humidityReading,
        }
      },
      { upsert: true }
    ).then((result) => {
      res.send(result)
    })
      .catch((err) => {
        console.log(err)
      })
    res.status(200)
  })

  
router.post("/get-actuator-status", (req, res) => {
  // const pastReading = {
  //   reading: req.body.reading,
  //   time: new Date()
  // }
  // console.log(pastReading)

  console.log(req.body.id)
  Unit.findOne({moduleID: new ObjectId(req.body.id)})
    .then((result) => {
      console.log(result)
      console.log(result.waterMotorActuator.activated)
      const data = {
        waterMotorActuator: result.waterMotorActuator.activated,
        lightActuator: result.lightActuator.activated,
        buzzerActuator: result.buzzerActuator.activated,
        fertilizerActuator: result.fertilizerActuator.activated
      }

      // console.log(res)
      res.json(data);
    })
    .catch((err) => {
      console.log(err);
    });
  res.status(200);
})
  
  

module.exports = router