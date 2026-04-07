// ============================================================
// Valoración Pedagógica catalogs
// ============================================================

export interface ValoracionQuestion {
  id: string;
  label: string;
}

export const MOVILIDAD_QUESTIONS: ValoracionQuestion[] = [
  { id: 'mov_1', label: '¿Requiere sistema y aditamentos de apoyo para la movilidad?' },
  { id: 'mov_2', label: '¿Requiere ajustes en el espacio físico y ambiente para favorecer su movilidad?' },
  { id: 'mov_3', label: '¿Se necesitan ajustes para la movilidad?' },
  { id: 'mov_4', label: '¿Requiere apoyos para favorecer su motricidad fina?' },
  { id: 'mov_5', label: '¿Requiere alguna adaptación para agarrar objetos?' },
];

export const COMUNICACION_QUESTIONS: ValoracionQuestion[] = [
  { id: 'com_1', label: '¿Requiere sistema de apoyo y ajustes para la comunicación?' },
  { id: 'com_2', label: '¿Cuenta con los aditamentos de apoyo a la comunicación?' },
  { id: 'com_3', label: '¿Se necesitan ajustes para garantizar la comunicación?' },
];

export const ACCESO_INFO_QUESTIONS: ValoracionQuestion[] = [
  { id: 'acc_1', label: '¿Requiere sistema de apoyo y ajustes para acceder a la información?' },
  { id: 'acc_2', label: '¿Se necesitan ajustes para garantizar el acceso a la información?' },
];

export const INTERACCION_SOCIAL_QUESTIONS: ValoracionQuestion[] = [
  { id: 'int_1', label: '¿Requiere sistema de apoyo y ajustes para la regulación de su comportamiento?' },
  { id: 'int_2', label: '¿Se necesitan ajustes para garantizar la interacción con sus pares y maestros?' },
];

export const ACADEMICO_QUESTIONS: ValoracionQuestion[] = [
  { id: 'aca_1', label: '¿Requiere ajustes en los tiempos de permanencia en el establecimiento educativo?' },
  { id: 'aca_2', label: '¿Requiere ajustes en los tiempos dedicados a una actividad?' },
];

export const INTENSIDAD_OPTIONS = [
  { value: 'ninguno', label: 'Ninguno' },
  { value: 'intermitente', label: 'Intermitente' },
  { value: 'extenso', label: 'Extenso' },
  { value: 'generalizado', label: 'Generalizado' },
] as const;

export interface ValoracionAspectoConfig {
  key: 'movilidad' | 'comunicacion' | 'accesoInformacion' | 'interaccionSocial' | 'academicoPedagogico';
  label: string;
  questions: ValoracionQuestion[];
}

export const VALORACION_ASPECTOS: ValoracionAspectoConfig[] = [
  { key: 'movilidad', label: 'Movilidad', questions: MOVILIDAD_QUESTIONS },
  { key: 'comunicacion', label: 'Comunicación', questions: COMUNICACION_QUESTIONS },
  { key: 'accesoInformacion', label: 'Acceso a la Información', questions: ACCESO_INFO_QUESTIONS },
  { key: 'interaccionSocial', label: 'Interacción Social', questions: INTERACCION_SOCIAL_QUESTIONS },
  { key: 'academicoPedagogico', label: 'Académico – Pedagógico', questions: ACADEMICO_QUESTIONS },
];

// ============================================================
// Competencias y Dispositivos catalogs
// ============================================================

export interface ChecklistItem {
  id: string;
  label: string;
}

export const COMPETENCIAS_LECTORAS_02: ChecklistItem[] = [
  { id: 'cl02_1', label: 'Se encuentra en etapa de garabateo' },
  { id: 'cl02_2', label: 'Respeta límites en el coloreado' },
  { id: 'cl02_3', label: 'Dibuja formas básicas (círculos, cuadrados)' },
  { id: 'cl02_4', label: 'Copia letras y palabras simples' },
  { id: 'cl02_5', label: 'Lee palabras simples' },
  { id: 'cl02_6', label: 'Comprende textos cortos leídos en voz alta' },
  { id: 'cl02_7', label: 'Escribe su nombre' },
  { id: 'cl02_8', label: 'Reconoce letras del alfabeto' },
  { id: 'cl02_9', label: 'Asocia fonema-grafema' },
  { id: 'cl02_10', label: 'Lee oraciones simples' },
  { id: 'cl02_11', label: 'Escribe oraciones simples con apoyo' },
  { id: 'cl02_12', label: 'Comprende instrucciones escritas simples' },
  { id: 'cl02_13', label: 'Narra con secuencia lógica' },
  { id: 'cl02_14', label: 'Escribe textos cortos (2-3 oraciones)' },
  { id: 'cl02_15', label: 'Utiliza signos de puntuación básicos' },
  { id: 'cl02_16', label: 'Lee con fluidez textos de su nivel' },
  { id: 'cl02_17', label: 'Resume textos leídos' },
  { id: 'cl02_18', label: 'Escribe con propósito comunicativo' },
];

export const COMPETENCIAS_LECTORAS_311: ChecklistItem[] = [
  { id: 'cl311_1', label: 'El estudiante evidencia una adecuada lectura "automática"' },
  { id: 'cl311_2', label: 'Lee con entonación y fluidez apropiada' },
  { id: 'cl311_3', label: 'Comprende el significado de palabras en contexto' },
  { id: 'cl311_4', label: 'Identifica idea principal de un párrafo' },
  { id: 'cl311_5', label: 'Hace inferencias a partir del texto' },
  { id: 'cl311_6', label: 'Distingue tipos de texto (narrativo, informativo)' },
  { id: 'cl311_7', label: 'Escribe textos con estructura clara' },
  { id: 'cl311_8', label: 'Usa conectores textuales apropiadamente' },
  { id: 'cl311_9', label: 'Revisa y corrige su escritura' },
  { id: 'cl311_10', label: 'Argumenta su punto de vista por escrito' },
  { id: 'cl311_11', label: 'Resume y parafrasea textos' },
  { id: 'cl311_12', label: 'Toma notas durante una exposición' },
  { id: 'cl311_13', label: 'Produce textos en diferentes géneros' },
  { id: 'cl311_14', label: 'Usa diccionario y recursos de consulta' },
  { id: 'cl311_15', label: 'Interpreta gráficas, tablas e imágenes en textos' },
  { id: 'cl311_16', label: 'Lee textos de divulgación científica y los comprende' },
  { id: 'cl311_17', label: 'Evalúa la credibilidad de fuentes escritas' },
  { id: 'cl311_18', label: 'Produce textos argumentativos con evidencia' },
];

export const COMPETENCIAS_MATEMATICAS: ChecklistItem[] = [
  { id: 'cm_1', label: 'Identifica nociones de cantidad poco-muchos, menos-más' },
  { id: 'cm_2', label: 'Clasifica objetos por color, forma, tamaño' },
  { id: 'cm_3', label: 'Cuenta objetos hasta 10' },
  { id: 'cm_4', label: 'Escribe números del 1 al 10' },
  { id: 'cm_5', label: 'Realiza adiciones y sustracciones simples' },
  { id: 'cm_6', label: 'Identifica figuras geométricas básicas' },
  { id: 'cm_7', label: 'Comprende el valor posicional (unidades, decenas)' },
  { id: 'cm_8', label: 'Resuelve problemas de la vida cotidiana con operaciones básicas' },
  { id: 'cm_9', label: 'Aplica multiplicación y división básica' },
  { id: 'cm_10', label: 'Comprende fracciones simples' },
  { id: 'cm_11', label: 'Lee e interpreta gráficas y tablas' },
  { id: 'cm_12', label: 'Maneja unidades de medida (longitud, peso, capacidad)' },
  { id: 'cm_13', label: 'Resuelve ecuaciones simples' },
  { id: 'cm_14', label: 'Comprende conceptos de área y perímetro' },
  { id: 'cm_15', label: 'Trabaja con números enteros y racionales' },
  { id: 'cm_16', label: 'Aplica regla de tres simple' },
  { id: 'cm_17', label: 'Maneja conceptos básicos de álgebra' },
  { id: 'cm_18', label: 'Resuelve problemas de geometría analítica' },
  { id: 'cm_19', label: 'Comprende estadística descriptiva básica' },
];

export const DISPOSITIVOS_MEMORIA: ChecklistItem[] = [
  { id: 'mem_1', label: 'Recuerda hechos pasados, ejemplo situaciones familiares (memoria episódica)' },
  { id: 'mem_2', label: 'Recuerda instrucciones de 2 o más pasos' },
  { id: 'mem_3', label: 'Recuerda nombres de personas conocidas' },
  { id: 'mem_4', label: 'Memoriza rimas, canciones o poemas cortos' },
  { id: 'mem_5', label: 'Recuerda secuencias de actividades cotidianas' },
  { id: 'mem_6', label: 'Retiene información aprendida de una sesión a otra' },
  { id: 'mem_7', label: 'Usa estrategias para recordar (repetición, organización)' },
];

export const DISPOSITIVOS_ATENCION: ChecklistItem[] = [
  { id: 'ate_1', label: 'Puede atender a un estímulo de principio a fin (atención sostenida)' },
  { id: 'ate_2', label: 'Puede cambiar de una actividad a otra sin dificultad (atención alternante)' },
  { id: 'ate_3', label: 'Puede atender a dos estímulos simultáneamente (atención dividida)' },
  { id: 'ate_4', label: 'Selecciona información relevante ignorando distractores (atención selectiva)' },
];

export const DISPOSITIVOS_PERCEPCION: ChecklistItem[] = [
  { id: 'per_1', label: 'Tiene la habilidad para dibujar líneas rectas, curvas con precisión' },
  { id: 'per_2', label: 'Discrimina sonidos del ambiente' },
  { id: 'per_3', label: 'Reconoce objetos por el tacto' },
  { id: 'per_4', label: 'Integra información de múltiples sentidos' },
  { id: 'per_5', label: 'Percibe correctamente el espacio y la distancia' },
];

export const DISPOSITIVOS_FUNCIONES_EJECUTIVAS: ChecklistItem[] = [
  { id: 'eje_1', label: 'Organiza su tiempo para poder cumplir con las tareas escolares' },
  { id: 'eje_2', label: 'Planifica los pasos para completar una tarea' },
  { id: 'eje_3', label: 'Controla impulsos en situaciones de espera' },
  { id: 'eje_4', label: 'Adapta su comportamiento a distintos contextos' },
  { id: 'eje_5', label: 'Monitorea su propio desempeño y corrige errores' },
  { id: 'eje_6', label: 'Mantiene metas y objetivos durante una tarea extensa' },
];

export const DISPOSITIVOS_LENGUAJE: ChecklistItem[] = [
  { id: 'len_1', label: 'Puede comunicarse con otros por vía oral o por otras vías (lengua de señas, tablero de comunicación, etc.)' },
  { id: 'len_2', label: 'Comprende vocabulario de su nivel académico' },
  { id: 'len_3', label: 'Expresa ideas completas en forma oral' },
  { id: 'len_4', label: 'Narra eventos con secuencia lógica' },
  { id: 'len_5', label: 'Formula preguntas para aclarar dudas' },
  { id: 'len_6', label: 'Participa en conversaciones respetando turnos' },
  { id: 'len_7', label: 'Comprende el lenguaje figurado (metáforas, refranes)' },
  { id: 'len_8', label: 'Adapta su lenguaje según el interlocutor' },
  { id: 'len_9', label: 'Usa el lenguaje para regular su propio comportamiento' },
  { id: 'len_10', label: 'Comprende y produce textos orales de divulgación' },
];

export interface CompetenciaGroup {
  key: 'competenciasLectoras02' | 'competenciasLectoras311' | 'competenciasMatematicas' | 'memoria' | 'atencion' | 'percepcion' | 'funcionesEjecutivas' | 'lenguajeComunicacion';
  label: string;
  items: ChecklistItem[];
  hasObservaciones?: boolean;
}

export const COMPETENCIAS_GRUPOS: CompetenciaGroup[] = [
  { key: 'competenciasLectoras02', label: 'Competencias Lectoras y Escriturales – Grado 0 a 2', items: COMPETENCIAS_LECTORAS_02, hasObservaciones: true },
  { key: 'competenciasLectoras311', label: 'Competencias Lectoras y Escriturales – Grado 3 a 11', items: COMPETENCIAS_LECTORAS_311, hasObservaciones: true },
  { key: 'competenciasMatematicas', label: 'Competencias Lógico Matemáticas – Grado 0 a 11', items: COMPETENCIAS_MATEMATICAS, hasObservaciones: true },
  { key: 'memoria', label: 'Dispositivos Básicos de Aprendizaje – Memoria', items: DISPOSITIVOS_MEMORIA },
  { key: 'atencion', label: 'Dispositivos Básicos de Aprendizaje – Atención', items: DISPOSITIVOS_ATENCION },
  { key: 'percepcion', label: 'Dispositivos Básicos de Aprendizaje – Percepción', items: DISPOSITIVOS_PERCEPCION },
  { key: 'funcionesEjecutivas', label: 'Dispositivos Básicos de Aprendizaje – Funciones Ejecutivas', items: DISPOSITIVOS_FUNCIONES_EJECUTIVAS },
  { key: 'lenguajeComunicacion', label: 'Lenguaje y Comunicación', items: DISPOSITIVOS_LENGUAJE, hasObservaciones: true },
];
