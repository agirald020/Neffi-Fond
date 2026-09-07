-- public.prefijos_fideicomisos definition

-- Drop table

-- DROP TABLE public.prefijos_fideicomisos;

CREATE TABLE public.prefijos_fideicomisos (
	prefijo varchar(5) NOT NULL,
	descripcion varchar(200) NOT NULL,
	estado varchar(5) NOT NULL,
	consecutivo int4 NOT NULL,
	CONSTRAINT pk_prefijos_fideicomisos PRIMARY KEY (prefijo)
);

insert into public.prefijos_fideicomisos(prefijo, descripcion, estado, consecutivo) values ('FA', 'Patrimonio Autónomo', 'ACT', 1);
insert into public.prefijos_fideicomisos(prefijo, descripcion, estado, consecutivo) values ('MR', 'Encargo Fiduciario', 'ACT', 1);
insert into public.prefijos_fideicomisos(prefijo, descripcion, estado, consecutivo) values ('FG', 'Fiducia en Garantía', 'ACT', 1);

commit;