const express = require('express')
const wol = require('node-wol')
const app = express()
const cors = require('cors')
const arp = require('arp')
const fs = require('fs');

app.use(cors())
app.use(express.json())

const PORT = 4000

function sendWOL (macAddress) {
  return new Promise((resolve, reject) => {
    wol.wake(macAddress, function (error) {
      if (error) {
        reject(error)
      } else {
        resolve(`Wake-on-LAN packet sent to ${macAddress}`)
      }
    })
  })
}

app.post('/wake', async (req, res) => {
  const macAddress = req.body.macAddress

  if (!macAddress) {
    return res.status(400).send('MAC address is required')
  }

  try {
    const response = await sendWOL(macAddress)
    res.send(response)
  } catch (error) {
    res.status(500).send(`Error sending WOL command: ${error.message}`)
  }
})

app.post('/get-mac', (req, res) => {
  const ipAddress = req.body.ipAddress

  if (!ipAddress) {
    return res.status(400).send('IP address is required')
  }

  arp.getMAC(ipAddress, function (err, mac) {
    if (err) {
      res.status(500).send(`Error retrieving MAC address: ${err.message}`)
    } else if (!mac) {
      res.status(404).send('No MAC address found for the given IP address')
    } else {
      res.send({ ipAddress, mac })
    }
  })
})

app.listen(PORT, () => {
  console.log(`Server is running on http://192.168.178.53:${PORT}`)
})
