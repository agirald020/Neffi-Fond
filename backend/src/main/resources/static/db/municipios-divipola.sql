-- public.divipola_municipios definition

-- Drop table

-- DROP TABLE public.divipola_municipios;

CREATE TABLE public.divipola_municipios (
	codigo_municipio bpchar(5) NOT NULL,
	codigo_departamento bpchar(2) NOT NULL,
	nombre varchar(150) NOT NULL,
	es_capital bool DEFAULT false NOT NULL,
	CONSTRAINT pk_municipios PRIMARY KEY (codigo_municipio),
	CONSTRAINT fk_mun_dep FOREIGN KEY (codigo_departamento) REFERENCES public.divipola_departamentos(codigo_departamento)
);
CREATE INDEX idx_municipios_departamento ON public.divipola_municipios USING btree (codigo_departamento);