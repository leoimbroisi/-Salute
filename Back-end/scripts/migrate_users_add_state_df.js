// Migração: adicionar campo state='DF' para usuários existentes sem estado
const { Client } = require('@elastic/elasticsearch');

const client = new Client({
    node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
});

async function migrate() {
    console.log('Iniciando migração: definir state=DF para usuários sem estado...');
    try {
        const search = await client.search({
            index: 'users',
            query: {
                bool: {
                    must_not: [{ exists: { field: 'state' } }],
                },
            },
            size: 1000,
        });

        const hits = search.hits.hits || [];
        console.log(`Encontrados ${hits.length} usuários sem estado.`);

        for (const hit of hits) {
            const id = hit._id;
            await client.update({
                index: 'users',
                id,
                doc: { state: 'DF' },
            });
            console.log(`Atualizado usuário ${id} -> state=DF`);
        }

        console.log('Migração concluída com sucesso.');
    } catch (err) {
        console.error('Erro na migração:', err && err.message ? err.message : err);
        process.exit(1);
    }
}

migrate();
