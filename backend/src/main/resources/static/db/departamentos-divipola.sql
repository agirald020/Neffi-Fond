-- public.divipola_departamentos definition

-- Drop table

-- DROP TABLE public.divipola_departamentos;

CREATE TABLE public.divipola_departamentos (
	codigo_departamento bpchar(2) NOT NULL,
	nombre varchar(100) NOT NULL,
	region varchar(60) NULL,
	CONSTRAINT pk_departamentos PRIMARY KEY (codigo_departamento)
);