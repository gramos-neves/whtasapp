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


app.listen(8080, ()=> {
    console.log("webhook is listening 8080")
})

app.get("/webhook", (req,res) => {
    let mode = req.query["hub.mode"];
    let challange = req.query["hub.challenge"]
    let token =req.query["hub.verify_token"];

    console.log(challange)
    console.log(token)
    console.log(mode)
    console.log("teste " + mytoken)
    

    if(mode && token){
        if(mode ==='subscribe' && token===mytoken){
            
            res.status(200).send(challange);
        }else{
            res.status(403).send("ok")
        }
    }
   // res.send("ok")
});


app.post("/webhook",  (req,res) => {
    let body_param = req.body;
     
 // console.log(req.body)
// console.log(JSON.stringify(body_param,null,2));

    if(body_param.object){
       
        if(body_param.entry && body_param.entry[0].changes && 
            body_param.entry[0].changes[0].value.messages &&
            body_param.entry[0].changes[0].value.messages[0]){

                let phon_no_id = body_param.entry[0].changes[0].value.metadata.phone_number_id;
                let from = body_param.entry[0].changes[0].value.messages[0].from;
                let button = body_param.entry[0].changes[0].value.messages?.[0].button.text;
               //let msg_body = req.body.entry[0].changes[0].value.messages[0].text.body;
           
                console.log(button) 
                console.log("Phone:" +  phon_no_id);
                console.log("from:" + from)
                 
              axios({
                    method: "POST",
                    url:"https://graph.facebook.com/v15.0/"+phon_no_id+"/messages?access_token="+token,
                    data:{
                        messaging_product:"whatsapp",
                        to:from,
                        text:{
                            body: "hi... Im teste"
                        }
                    },
                    headers: {
                        "Content-Type":"application/json"
                    }
                });
             
               res.sendStatus(200)
           
            }else{
                res.sendStatus(200)
            }
    }
})