import { Controller, Get } from "@nestjs/common";
@Controller()
export class AppController{
 @Get("health") health(){return {service:"ServeIQ API",status:"ok",version:"0.1.0"}}
 @Get("products") products(){return [
  {nameAr:"مجبوس اللحم",price:6},
  {nameAr:"مجبوس الدجاج",price:2.5},
  {nameAr:"هريسة حساوية",price:1.5},
  {nameAr:"جريش",price:1.5}
 ]}
}
