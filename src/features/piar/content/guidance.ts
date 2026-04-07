// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SectionGuideContent {
  title: string;
  paragraphs: string[];
  correctExample?: { label?: string; text: string };
  incorrectExample?: { label?: string; text: string };
  reference?: string;
}

export interface FieldPlaceholder {
  placeholder: string;
}

export interface EntornoPrompt {
  key: string;
  label: string;
  helpText: string;
  placeholder: string;
}

// ---------------------------------------------------------------------------
// Section Guides
// ---------------------------------------------------------------------------

export const sectionGuides: Record<string, SectionGuideContent> = {
  informacionGeneral: {
    title: 'Información General',
    paragraphs: [
      'Esta sección identifica la institución educativa, la sede, la jornada y la persona que diligencia el PIAR.',
      'Diligencie todos los campos con la información oficial del establecimiento y use la fecha real de elaboración del documento.',
    ],
  },
  datosEstudiante: {
    title: 'Datos del Estudiante',
    paragraphs: [
      'Registre los datos de identificación del estudiante tal como aparecen en el SIMAT.',
      'Complete también la información de contexto, ubicación y contacto para que el PIAR pueda acompañar adecuadamente la trayectoria escolar.',
    ],
  },
  firmas: {
    title: 'Firmas',
    paragraphs: [
      'Las firmas constituyen el Acta de Acuerdo del PIAR. La firma de la familia o cuidadores representa su compromiso con el acompañamiento del proceso educativo del estudiante.',
      'Sin las firmas correspondientes, el PIAR carece de validez legal como acta de acuerdo. Asegúrese de que todos los responsables firmen el documento.',
    ],
  },
  entornoSalud: {
    title: 'Entorno de Salud',
    paragraphs: [
      'Registre la información de salud que sea relevante para el proceso educativo inclusivo del estudiante.',
    ],
  },
  entornoHogar: {
    title: 'Entorno del Hogar',
    paragraphs: [
      'Información sobre el núcleo familiar y el entorno del hogar del estudiante.',
    ],
  },
  entornoEducativo: {
    title: 'Entorno Educativo',
    paragraphs: [
      'Antecedentes educativos e información sobre la trayectoria escolar del estudiante.',
    ],
  },
  valoracionPedagogica: {
    title: 'Valoración Pedagógica',
    paragraphs: [
      'Valoración de los apoyos requeridos en cada aspecto del desarrollo del estudiante.',
    ],
  },
  competenciasDispositivos: {
    title: 'Competencias y Dispositivos de Aprendizaje',
    paragraphs: [
      'Marque las competencias y dispositivos básicos de aprendizaje que el estudiante evidencia.',
    ],
  },
  ajustesRazonables: {
    title: 'Ajustes Razonables',
    paragraphs: [
      'Describa los ajustes razonables que se implementarán para eliminar las barreras identificadas en el proceso de aprendizaje.',
    ],
  },
  actaAcuerdo: {
    title: 'Acta de Acuerdo',
    paragraphs: [
      'Acta de acuerdo que formaliza los compromisos entre la institución, la familia y el estudiante.',
      'La fecha, el lugar, la institución y el resumen del estudiante se sincronizan automáticamente con Información General y Datos del Estudiante.',
    ],
  },
};

// ---------------------------------------------------------------------------
// Field Placeholders — data
// ---------------------------------------------------------------------------

export const fieldPlaceholders: Record<string, FieldPlaceholder> = {
  // Header fields
  'header.institucionEducativa': { placeholder: 'Ej: Institución Educativa Nacional' },
  'header.sede': { placeholder: 'Ej: Sede Principal' },
  'header.jornada': { placeholder: 'Ej: Mañana' },
  'header.lugarDiligenciamiento': { placeholder: 'Ej: Bogotá D.C.' },
  'header.nombrePersonaDiligencia': { placeholder: 'Ej: María López' },
  'header.rolPersonaDiligencia': { placeholder: 'Ej: Docente de aula' },

  // Student fields
  'student.nombres': { placeholder: 'Ej: Juan David' },
  'student.apellidos': { placeholder: 'Ej: Martínez Rojas' },
  'student.tipoIdentificacion': { placeholder: 'Ej: TI' },
  'student.numeroIdentificacion': { placeholder: 'Ej: 1.098.765.432' },
  'student.lugarNacimiento': { placeholder: 'Ej: Bogotá' },
  'student.fechaNacimiento': { placeholder: 'Ej: 2015-04-28' },
  'student.edad': { placeholder: 'Ej: 10 años' },
  'student.grado': { placeholder: 'Ej: 5° de primaria' },
  'student.departamento': { placeholder: 'Ej: Cundinamarca' },
  'student.municipio': { placeholder: 'Ej: Bogotá' },
  'student.barrio': { placeholder: 'Ej: El Prado' },
  'student.direccion': { placeholder: 'Ej: Calle 45 #12-30, Barrio El Prado' },
  'student.telefono': { placeholder: 'Ej: 310 456 7890' },
  'student.correo': { placeholder: 'Ej: acudiente@ejemplo.com' },
};

// ---------------------------------------------------------------------------
// Entorno Prompts
// ---------------------------------------------------------------------------

export const entornoPrompts: EntornoPrompt[] = [
  {
    key: 'fortalezas',
    label: 'Fortalezas del estudiante',
    helpText:
      'Describa las habilidades, talentos y capacidades que el estudiante demuestra en el entorno escolar y familiar. Enfóquese en lo que el estudiante SÍ puede hacer.',
    placeholder: 'Ej: Muestra habilidad para el dibujo y se expresa bien de forma oral',
  },
  {
    key: 'contextoFamiliar',
    label: 'Contexto familiar y social',
    helpText:
      'Describa la composición familiar, las condiciones del hogar y las dinámicas de apoyo que rodean al estudiante. Incluya quién acompaña el proceso educativo.',
    placeholder: 'Ej: Vive con su madre y abuela; la madre trabaja en jornada completa',
  },
  {
    key: 'entornoSalud',
    label: 'Entorno de salud',
    helpText:
      'Registre información relevante de salud: diagnósticos, terapias, medicamentos o condiciones que impacten el aprendizaje. Esta información es un insumo para comprender el contexto del estudiante, no una justificación para la exclusión.',
    placeholder: 'Ej: Asiste a terapia ocupacional dos veces por semana',
  },
  {
    key: 'actividadesExternas',
    label: 'Actividades externas',
    helpText:
      'Indique las actividades que el estudiante realiza fuera de la institución educativa: deportes, terapias, actividades culturales, religiosas u otras.',
    placeholder: 'Ej: Participa en un grupo de natación los sábados',
  },
  {
    key: 'intereses',
    label: 'Intereses y motivaciones',
    helpText:
      'Registre los temas, actividades o áreas que despiertan la curiosidad y motivación del estudiante. Estos intereses pueden aprovecharse como punto de partida para los ajustes.',
    placeholder: 'Ej: Le interesan los animales y disfruta las clases de ciencias',
  },
];
