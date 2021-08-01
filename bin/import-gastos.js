(async () => {
    try {
        const { MongoClient } = require('mongodb');
        const fs = require('fs');
        const csvParse = require("csv-parse/lib/sync");

        const mongourl = 'mongodb://localhost:27017';
        const filepath = process.argv[2];
        
        console.log('filepath='+filepath);

        const data = fs.readFileSync(filepath).toString();

        const gastos = csvParse(data, { columns: true });

        gastos.forEach(gasto => {
            const [ day, month, year ] = gasto.fecha.split('/');
            gasto.fecha = new Date(`${month}-${day}-${year}`);
            gasto.monto = parseInt(gasto.monto);
        });

        const client = new MongoClient(mongourl);

        await client.connect();

        const response = await client
            .db('gastos')
            .collection('gastos')
            .insertMany(gastos);

        client.close();
    } catch(e) {
        console.error(e);
    }
})();