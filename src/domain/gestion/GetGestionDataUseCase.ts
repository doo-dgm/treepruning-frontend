import type { GestionRepository }       from './GestionRepository'
import type { EntityType, GestionResult, GestionRow } from './GestionEntity'

const staticData: Partial<Record<EntityType, GestionRow[]>> = {
  personas: [
    { nombre: 'Danilo Cordoba',  documento: 'CC', numeroDocumento: '1111111111', fechaNacimiento: '5/21/1998',  direccion: 'Vereda las Cuchillas',  telefono: '1111111111', email: 'danilo.cordoba9497@uco.net.co'  },
    { nombre: 'Michel Guarnizo', documento: 'CC', numeroDocumento: '2222222222', fechaNacimiento: '12/28/2002', direccion: 'Cra 29 # 40-82',         telefono: '0000000000', email: 'michel.guarnizo2701@uco.net.co' },
    { nombre: 'Danilo Cordoba',  documento: 'CC', numeroDocumento: '2222222222', fechaNacimiento: '5/23/1998',  direccion: 'AV 38 C # 40-50',         telefono: '3333333333', email: 'juan.grisales2711@uco.net.co'  },
  ],
  sector: [
    { nombre: 'Porvenir Tercera Etapa',                  municipio: 'Rionegro-Antioquia-Colombia' },
    { nombre: 'El porvenir comuna 4 villa manuela',      municipio: 'Rionegro-Antioquia-Colombia' },
    { nombre: 'El centro comuna 3 avenida galan',        municipio: 'Rionegro-Antioquia-Colombia' },
    { nombre: 'San Antonio comuna 1 san bartolo',        municipio: 'Rionegro-Antioquia-Colombia' },
    { nombre: 'Santa ana comuna 2 altos de la Pereira',  municipio: 'Rionegro-Antioquia-Colombia' },
  ],
  familia: [
    { nombreCientifico: 'Araucaria heterophylla',          nombreComun: 'Araucaria'        },
    { nombreCientifico: 'Syzygium paniculata',             nombreComun: 'Eugenia'          },
    { nombreCientifico: 'Archontophoenix cunninghamiana',  nombreComun: 'Palma payanesa'   },
    { nombreCientifico: 'Inga sp',                         nombreComun: 'Inga'             },
    { nombreCientifico: 'Handroanthus chrysanthus',        nombreComun: 'Guayacán amarillo'},
  ],
  herramienta: [
    { nombre: 'Pala',     descripcion: 'Herramienta manual utilizada para cavar y mover tierra.'                        },
    { nombre: 'Tijera',   descripcion: 'Herramienta manual utilizada para realizar cortes en ramas delgadas y hojas.'   },
    { nombre: 'Pico',     descripcion: 'Herramienta de mano con punta metalica empleada para remover tierra dura.'      },
    { nombre: 'Escalera', descripcion: 'Estructura portatil para acceder a ramas de diferentes alturas.'                },
    { nombre: 'Arnes',    descripcion: 'Equipo de proteccion personal para podas en altura.'                            },
  ],
}

export class GetGestionDataUseCase {
  constructor(private readonly repo: GestionRepository) {}

  async execute(entity: EntityType): Promise<GestionResult> {
    // Entidades estáticas — no necesitan llamada al repo
    if (staticData[entity]) {
      const rows = staticData[entity]!
      return { columns: Object.keys(rows[0] ?? {}), rows }
    }

    // Entidades dinámicas — van al repo
    const raw  = await this.repo.getByEntity(entity)
    const rows = raw.map(flattenRow)
    return { columns: Object.keys(rows[0] ?? {}), rows }
  }
}

// ── Helper privado ─────────────────────────────────────
function flattenRow(row: GestionRow): GestionRow {
  const flat: GestionRow = {}
  for (const [key, value] of Object.entries(row)) {
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      for (const [subKey, subValue] of Object.entries(value as object)) {
        flat[`${key}.${subKey}`] = subValue
      }
    } else {
      flat[key] = value
    }
  }
  return flat
}
