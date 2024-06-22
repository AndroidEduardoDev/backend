import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import axios from 'axios';
import { parseStringPromise } from 'xml2js';
import { create } from 'xmlbuilder2';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Post("controllerservices/controller/ProcesosController.asmx")
  async getHello(@Body() jsonRequest): Promise<any> {
    let xmls = this.convertJsonToXml(jsonRequest)
    var data;
    await axios.post('http://controller.biomax.co:7093/controllerservices/controller/ProcesosController.asmx',
      xmls,
      {
        headers:
          { 'Content-Type': 'text/xml' }
      }).then(async (res) => {
        data = await this.convertXmlToJson(res.data);
       
      }).catch(async (err) => { 
        data = await this.convertXmlToJson(err.mes);
       });


    return  data
  }

  async  convertXmlToJson(xml: string) {
    try {
      const result = await parseStringPromise(xml);
      return(JSON.parse(JSON.stringify(result, null, 2)));
    } catch (err) {
      return {"error": "cannot be converted"}
    }
  }


   convertJsonToXml(json: any): string {
    const doc = create({ version: '1.0', encoding: 'UTF-8' })
    .ele('soap:Envelope', {
      'xmlns:soap': "http://schemas.xmlsoap.org/soap/envelope/",
      'xmlns:xsi': "http://www.w3.org/2001/XMLSchema-instance",
      'xmlns:xsd': "http://www.w3.org/2001/XMLSchema"
    });
    const header = doc.ele('soap:Header');
    const credencial = header.ele('Credencial', { xmlns: 'http://consware.com.co' });
    credencial.ele('Usuario').txt(json.Envelope.Header.Credencial.Usuario);
    credencial.ele('Clave').txt(json.Envelope.Header.Credencial.Clave);
    credencial.ele('CodigoEDS').txt(json.Envelope.Header.Credencial.CodigoEDS);
  
    const body = doc.ele('soap:Body');
    const solicitud = body.ele('SolicitarAutorizacionCredito', { xmlns: 'http://consware.com.co' });
    const solicitudData = solicitud.ele('solicitud');
    solicitudData.ele('Placa').txt(json.Envelope.Body.SolicitarAutorizacionCredito.solicitud.Placa);
    solicitudData.ele('Kilometraje').txt(json.Envelope.Body.SolicitarAutorizacionCredito.solicitud.Kilometraje);
    solicitudData.ele('CodigoEDS').txt(json.Envelope.Body.SolicitarAutorizacionCredito.solicitud.CodigoEDS);
    solicitudData.ele('NumeroIdentificador').txt(json.Envelope.Body.SolicitarAutorizacionCredito.solicitud.NumeroIdentificador);
    solicitudData.ele('TipoIdentificador').txt(json.Envelope.Body.SolicitarAutorizacionCredito.solicitud.TipoIdentificador);
    solicitudData.ele('CodigoMaterial').txt(json.Envelope.Body.SolicitarAutorizacionCredito.solicitud.CodigoMaterial);
  
    const xml = doc.end({ prettyPrint: true });
    return xml;
  }
}
