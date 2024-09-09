exports.up = knex => knex.schema.createTable("dishes", table =>{
    table.increments("id");
    table.text("name");
    table.text("description");
    table.text("img");
    table.float("value");
    table.enu("category_id", ["refeição", "bebida", "sobremesa"], { useNative: true, enumName: "category_id"}).notNullable().defaultTo("refeição");
    table.integer("user_id").references("id").inTable("users").onDelete("CASCADE");
    table.timestamp("created_at").default(knex.fn.now());
    table.timestamp("updated_at").default(knex.fn.now());
});

exports.down =  knex => knex.schema.dropTable("dishes");