const express = require("express");
//const cors = require('cors')
const body_parser = require("body-parser");
const axios = require("axios");
require('dotenv').config();

const app = express();

app.use(body_parser.json());
//app.use(cors())

const token=process.env.TOKEN
const mytoken=process.env.MYTOKEN 

var agendas = []

app.listen(8080, ()=> {
    console.log(agendas)
    console.log("webhook is listening 8080")
})

app.get("/webhook", (req,res) => {
    let mode = req.query["hub.mode"];
    let challange = req.query["hub.challenge"]
    let token =req.query["hub.verify_token"];

    //console.log(challange)
    console.log(token)
    console.log(mode)

    if(mode && token){
        if(mode ==='subscribe' && token===mytoken){
            
            res.status(200).send(challange);
        }else{
            res.status(403).send("ok")
        }
    }
});


app.post("/webhook", async  (req,res) => {
    let body_param = req.body;
    const agenda = {} 
 // console.log(req.body)
// console.log(JSON.stringify(body_param,null,2));

    if(body_param.object){
       
        if(body_param.entry && body_param.entry[0].changes && 
            body_param.entry[0].changes[0].value.messages &&
            body_param.entry[0].changes[0].value.messages[0]){

                let phon_no_id = body_param.entry[0].changes[0].value.metadata.phone_number_id;
                let from = body_param.entry[0].changes[0].value.messages[0].from;
                let button = body_param.entry[0].changes[0].value.messages?.[0].button;
                let wamid = body_param.entry[0].changes[0].value.messages?.[0].context;
               
                let msg_body = req.body.entry[0].changes[0].value.messages?.[0].text;
              
                // console.log(button) 
                console.log(wamid)
               // console.log("Phone:" +  phon_no_id);
                console.log("from: " + from)
              
                 
             if(button){ 
                
               agenda.button = button.text
               agenda.wamid = wamid.id
               agenda.from = from
               agenda.phon_no_id = phon_no_id

               agendas.push(agenda)
              
              console.log(agendas)  

               /*
              await axios({
                        method: "POST",
                        url:"https://graph.facebook.com/v15.0/"+phon_no_id+"/messages",
                        data:{
                            messaging_product:"whatsapp",
                            recipient_type: "individual",
                            to:from,
                            type: "text",
                            text:{
                                body: button.text
                            }
                        },
                        headers: {
                            "Content-Type":"application/json",
                            "Authorization":"Bearer "+token
                        }
                    });*/


                }
                
               res.sendStatus(200)
           
            }else if(msg_body){
                console.log(msg_body.body)
               res.sendStatus(200)
            }else{
               res.sendStatus(200)
            }
    }
})

app.get("/listen", (req, res) => {
    
    let agendasNew = agendas;
    agendas = [] 

   res.status(200).send(JSON.stringify(agendasNew));
  });