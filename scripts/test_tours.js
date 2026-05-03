const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.tour.findMany({ 
  where: { 
    OR: [
      {title: {contains: 'เฉิงตู'}}, 
      {destination: {contains: 'เฉิงตู'}}, 
      {title: {contains: 'คุนหมิง'}}, 
      {destination: {contains: 'คุนหมิง'}}
    ] 
  } 
}).then(t => {
  console.log('Found:', t.length);
  console.log(t.map(x=>x.title));
}).finally(()=>p.$disconnect());
