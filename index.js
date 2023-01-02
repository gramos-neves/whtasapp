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
       
                console.log("from: " + from)
                
                var expr = body_param.entry[0].changes[0].value.messages?.[0].type;

                switch(expr){
                    case 'text':
                        let msg_body = req.body.entry[0].changes[0].value.messages?.[0].text;
                        acaonaopermitida(from,phon_no_id)  
                     //console.log(msg_body.body)
                        console.log('text')
                        break;
                    case 'button':
                        let button = body_param.entry[0].changes[0].value.messages?.[0].button;
                        let wamid = body_param.entry[0].changes[0].value.messages?.[0].context;

                        console.log(wamid)
                        agenda.button = button.text
                        agenda.wamid = wamid.id
                        agenda.from = from
                        agenda.phon_no_id = phon_no_id
                        agenda.body = body_param
         
                        agendas.push(agenda)
                        
                        console.log('button')
                        break;
                    case 'sticker':
                        acaonaopermitida(from,phon_no_id)  
                        console.log('sticker')
                        break;
                    case 'image':
                        acaonaopermitida(from,phon_no_id)  
                        console.log('image')
                        break;   
                    case 'document':
                        acaonaopermitida(from,phon_no_id)  
                        console.log('document')
                        break;
                    case 'video':
                        acaonaopermitida(from,phon_no_id)  
                        console.log('video')
                        break;
                    case 'audio':
                        acaonaopermitida(from,phon_no_id)  
                        console.log('video')
                        break;
                    default:  
                        console.log("default")
                }   

             /*        
             if(button){ 
              // console.log(agendas)

             }else if(msg_body){
                    console.log("messagem de digitada")
           
                }*/
                
               res.sendStatus(200)
           
            }else{
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



app.get("/listen", (req, res) => {
    
    let agendasNew = agendas;
    agendas = [] 

   res.status(200).send(JSON.stringify(agendasNew));
  });