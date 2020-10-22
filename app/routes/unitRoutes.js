const express = require("express");
const router = express.Router();
const Unit = require("../models/unitModel");
const { ObjectId } = require("mongodb");

router.post("/connect-unit", (req, res) => {
  const unit = new Unit(req.body);

  console.log(unit);
  unit
    .save()
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      res.status(400);
      console.log(err);
    });
  res.status(200);
});

router.post("/update-data", (req, res) => {
  console.log("updating data");
  const time = new Date();
  let vulnerable = false

  const soilMoistureReading = {
    reading: req.body.soilMoisture,
    time: time,
  };

  const humidityReading = {
    reading: req.body.humidity,
    time: time,
  };

  const temperatureReading = {
    reading: req.body.temperature,
    time: time,
  };

  const lightIntensityReading = {
    reading: req.body.lightIntensity,
    time: time,
  };

  if(soilMoistureReading.reading==0 || humidityReading.reading==0 || temperatureReading.reading==0 || lightIntensityReading.reading==0){
    vulnerable = true
  }
  else{
    vulnerable = false
  }
  // add buzzer state also

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

      //vulnerable
      "vulnerable": vulnerable,

      // past readings
      $push: {
        "soilMoistureSensor.pastReadings": soilMoistureReading,
        "temperatureSensor.pastReadings": temperatureReading,
        "lightIntensitySensor.pastReadings": lightIntensityReading,
        "humiditySensor.pastReadings": humidityReading,
      },
    },
    { upsert: true }
  )
    .then((updateResult) => {
      console.log(updateResult)

      Unit.updateOne(
        { moduleID: req.body.moduleID },
        {
          $pull: {
            "soilMoistureSensor.pastReadings": {
              time: {
                $lt: new Date(time.getTime() - 1000 * 60 * 10),
              },
            },
            "temperatureSensor.pastReadings": {
              time: {
                $lt: new Date(time.getTime() - 1000 * 60 * 10),
              },
            },
            "lightIntensitySensor.pastReadings": {
              time: {
                $lt: new Date(time.getTime() - 1000 * 60 * 10),
              },
            },
            "humiditySensor.pastReadings": {
              time: {
                $lt: new Date(time.getTime() - 1000 * 60 * 10),
              },
            },
          },
        }
        // { multi: true }
      )
        .then((result) => {
          console.log(result);
          res.send(result);
        })
        .catch((err) => {
          console.log(err);
          res.send(err);
        });
      // res.send(result);
    })
    .catch((err) => {
      console.log(err);
      res.send(err);
    });
  res.status(200);
});

router.post("/get-actuator-status", (req, res) => {
  // const pastReading = {
  //   reading: req.body.reading,
  //   time: new Date()
  // }
  // console.log(pastReading)

  console.log("recieving actuator status");
  console.log(req.body.id);
  Unit.findOne({ moduleID: new ObjectId(req.body.id) })
    .then((result) => {
      console.log(result);
      console.log(result.waterMotorActuator.activated);
      const data = {
        waterMotorA: result.waterMotorActuator.activated,
        lightA: result.lightActuator.activated,
        buzzerA: result.buzzerActuator.activated,
        fertilizerA: result.fertilizerActuator.activated,
        automated: result.automated,
      };

      // console.log(res)
      res.json(data);
    })
    .catch((err) => {
      console.log(err);
    });
  res.status(200);
});

router.post("/delete-data", (req, res) => {
  console.log("deleting data");
  const time = new Date();

  Unit.updateOne(
    { moduleID: req.body.moduleID },
    {
      $pull: {
        "soilMoistureSensor.pastReadings": {
          time: {
            $lt: new Date(time.getTime() - 1000 * 60 * 60),
          },
        },
        "temperatureSensor.pastReadings": {
          time: {
            $lt: new Date(time.getTime() - 1000 * 60 * 60),
          },
        },
        "lightIntensitySensor.pastReadings": {
          time: {
            $lt: new Date(time.getTime() - 1000 * 60 * 60),
          },
        },
        "humiditySensor.pastReadings": {
          time: {
            $lt: new Date(time.getTime() - 1000 * 60 * 60),
          },
        },
      },
    }
    // { multi: true }
  )
    .then((result) => {
      console.log(result);
      res.send(result);
    })
    .catch((err) => {
      console.log(err);
      res.send(err);
    });
  res.status(200);
});

module.exports = router;
