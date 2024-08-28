package schema

import (
	"database/sql"
	"github.com/9ziggy9/core"
)

func TableExists(db *sql.DB, tableName string) (bool, error) {
	query := `
	SELECT EXISTS (
		SELECT 1 
		FROM information_schema.tables 
		WHERE table_schema = 'public' 
		AND table_name = $1
	);`
	var exists bool
	err := db.QueryRow(query, tableName).Scan(&exists)
	return exists, err
}

func BootstrapTable(db *sql.DB, sql_str string) {
	exists, err := TableExists(db, "users");
	if err != nil {
		core.Log(core.ERROR, "%s\n", err);
	} else if exists == false {
		_, err := db.Exec(sql_str);
		if err != nil { core.Log(core.ERROR, "%s\n", err); }
		core.Log(core.SUCCESS, "'users' table created");
	} else {
		core.Log(core.INFO, "'users' table already exists");
	}
}
