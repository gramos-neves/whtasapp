const express = require("express");
const body_parser = require("body-parser");
const axios = require("axios");
require('dotenv').config();

const app = express();

app.use(body_parser.json());

const token=process.env.TOKEN
const mytoken=process.env.MYTOKEN 

var agendas = []
var arrStatus =[]

app.listen(8080, ()=> {
   // console.log(agendas)
    console.log("webhook is listening 8080")
})

app.get("/webhook", (req,res) => {
    let mode = req.query["hub.mode"];
    let challange = req.query["hub.challenge"]
    let token =req.query["hub.verify_token"];

    //console.log(challange)
    //console.log(token)
    // console.log(mode)
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

// console.log(JSON.stringify(body_param,null,2));

    if(body_param.object){
       
        if(body_param.entry && body_param.entry[0].changes && 
            body_param.entry[0].changes[0].value.messages &&
            body_param.entry[0].changes[0].value.messages[0]){

                let phon_no_id = body_param.entry[0].changes[0].value.metadata.phone_number_id;
                let from = body_param.entry[0].changes[0].value.messages[0].from;
       
               // console.log("from: " + from)
               
            var expr = body_param.entry[0].changes[0].value.messages?.[0].type;

                switch(expr){
                    case 'text':
                        //let msg_body = req.body.entry[0].changes[0].value.messages?.[0].text;
                        let text_id = body_param.entry[0].changes[0].value.messages?.[0].id;
                        await acaonaopermitidaNew(from,phon_no_id,text_id)  
                        break;
                    case 'button':
                        let button = body_param.entry[0].changes[0].value.messages?.[0].button;
                        let wamid = body_param.entry[0].changes[0].value.messages?.[0].context;

                        //console.log(wamid)
                        agenda.button = button.text
                        agenda.wamid = wamid.id
                        agenda.from = from
                        agenda.phon_no_id = phon_no_id
                        agenda.body = body_param
         
                        agendas.push(agenda)
                        //console.log('button')
                        break;
                    case 'sticker':
                        let sticker_id = body_param.entry[0].changes[0].value.messages?.[0].id; 
                       await acaonaopermitidaNew(from,phon_no_id,sticker_id)  
                        //console.log('sticker')
                        break;
                    case 'image':
                       await acaonaopermitida(from,phon_no_id)
                        //console.log('image')
                        break;   
                    case 'document':
                       await acaonaopermitida(from,phon_no_id)  
                        //console.log('document')
                        break;
                    case 'video':
                      await  acaonaopermitida(from,phon_no_id)  
                        //console.log('video')
                        break;
                    case 'audio':
                      await  acaonaopermitida(from,phon_no_id)  
                        //console.log('audio')
                        break;
                    case 'location':
                      await  acaonaopermitida(from,phon_no_id)  
                        //console.log('location')
                        break;   
                    default:  
                        console.log("default")
                }   

               res.sendStatus(200)
            }else{

               var status = !!body_param.entry[0].changes[0].value.statuses
                 
               if(status === true){
                   let phon_no_id = body_param.entry[0].changes[0].value.metadata.phone_number_id;
                   let from = body_param.entry[0].changes[0].value.statuses[0].recipient_id;
                   let statu = body_param.entry[0].changes[0].value.statuses[0].status;
                //   console.log(body_param.entry[0].changes[0].value) 
                   arrStatus.push(body_param.entry[0].changes[0].value)
                          
               }


               res.sendStatus(200)
            }
    }
})

async function acaonaopermitida(from, phon_no_id){
    await axios({
        method: "POST",
        url:"https://graph.facebook.com/v15.0/"+phon_no_id+"/messages",
        data:{
            messaging_product:"whatsapp",
            recipient_type: "individual",
            to:from,
            type: "text",
            text:{
                body: 'Ação não permitida!'
            }
        },
        headers: {
            "Content-Type":"application/json",
            "Authorization":"Bearer "+token
        }
    })

}

async function acaonaopermitidaNew(from, phon_no_id,wam_id){
    await axios({
        method: "POST",
        url:"https://graph.facebook.com/v15.0/"+phon_no_id+"/messages",
        data:{
            messaging_product:"whatsapp",
            context: {
                message_id: ""+wam_id+""
              },
            to:from,
            type: "text",
            text:{
                preview_url: false,
                body: 'Ação não permitida!'
            }
        },
        headers: {
            "Content-Type":"application/json",
            "Authorization":"Bearer "+token
        }
    })

}

app.get("/listen", (req, res) => {
    let agendasNew = agendas;
    agendas = [] 

   res.status(200).send(JSON.stringify(agendasNew));
  });

  app.get("/status", (req, res) => {
    let statusNew = arrStatus;
    arrStatus = [] 
    
   // console.log(statusNew)
   //res.status(200).send(JSON.stringify(statusNew));
   res.status(200).send(statusNew);
  });