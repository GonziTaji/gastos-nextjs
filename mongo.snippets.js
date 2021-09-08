db.getCollection('gastos').aggregate([
    {
        $match: {
            fecha: {
                $gte: new Date('2021-07-01'),
                $lte: new Date('2021-07-31'),
            },
        },
    },
    {
        $set: {
            tipo: {
                $cond: {
                    if: {
                        $regexMatch: {
                            input: '$tipo',
                            regex: /abono/i,
                        },
                    },
                    then: 'abono',
                    else: 'gasto',
                },
            },
        },
    },
    {
        $group: {
            _id: { pagador: '$pagador', tipo: '$tipo' },
            total: { $sum: '$monto' },
        },
    },
    {
        $project: {
            _id: { $concat: ['$_id.pagador', ' ', '$_id.tipo'] },
            pagador: '$_id.pagador',
            tipo: {
                $cond: {
                    if: '$_id.isAbono',
                    then: 'abono',
                    else: 'gasto',
                },
            },
            total: '$total',
        },
    },
]);

db.getCollection('gastos').aggregate([
    {
        $match: {
            fecha: {
                $gte: new Date('2021-07-01'),
                $lte: new Date('2021-07-31'),
            },
        },
    },
    {
        $set: {
            tipo: {
                $cond: {
                    if: {
                        $regexMatch: {
                            input: '$tipo',
                            regex: /abono/i,
                        },
                    },
                    then: 'abono',
                    else: 'gasto',
                },
            },
        },
    },
    {
        $group: {
            _id: { pagador: '$pagador', tipo: '$tipo' },
            total: { $sum: '$monto' },
        },
    },
    {
        $group: {
            _id: '$_id.pagador',
            items: { $push: { total: '$total', tipo: '$_id.tipo' } },
        },
    },
    {
        $set: {
            reduceResult: {
                $reduce: {
                    input: '$items',
                    initialValue: { abono: 0, gasto: 0 },
                    in: {
                        abono: {
                            $cond: {
                                if: { $eq: ['$$this.tipo', 'abono'] },
                                then: {
                                    $add: ['$$value.abono', '$$this.total'],
                                },
                                else: '$$value.abono',
                            },
                        },
                        gasto: {
                            $cond: {
                                if: { $eq: ['$$this.tipo', 'gasto'] },
                                then: {
                                    $add: ['$$value.gasto', '$$this.total'],
                                },
                                else: '$$value.gasto',
                            },
                        },
                    },
                },
            },
        },
    },
    {
        $project: {
            abono: '$reduceResult.abono',
            gasto: '$reduceResult.gasto',
            pagador: '$_id',
        },
    },
]);


db.getCollection('gastos').aggregate([
    {
        $match: {
            fecha: {
                $gte: new Date('2021-07-01'),
                $lte: new Date('2021-07-31'),
            },
            tipo: { 
                $not: /abono/i
            }
        },
    },
    {
        $group: {
            _id: '$tipo',
            monto: { $sum: '$monto'}
        }
    },
    {
        $addFields: {
            tipo: '$_id',
        }
    },
    {
        $sort: {
            monto: -1
        }
    }
])