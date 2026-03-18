import { renderToBuffer } from "@react-pdf/renderer/lib/react-pdf.js";
import { createElement } from "react";
import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer/lib/react-pdf.js";

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 9 },
  title: { fontSize: 12, fontFamily: "Helvetica-Bold", textAlign: "center", marginBottom: 14 },
  preamble: { fontSize: 8.5, lineHeight: 1.5, textAlign: "justify", marginBottom: 10 },
  legalText: { fontSize: 8.5, lineHeight: 1.5, textAlign: "justify", marginBottom: 6 },
  boldText: { fontFamily: "Helvetica-Bold" },
  numberedItem: { fontSize: 8.5, lineHeight: 1.5, textAlign: "justify", marginBottom: 6, paddingLeft: 10 },
  subItem: { fontSize: 8.5, lineHeight: 1.5, textAlign: "justify", marginBottom: 3, paddingLeft: 20 },
  signConformity: { marginTop: 10, marginBottom: 14, fontSize: 8.5, lineHeight: 1.5, textAlign: "justify" },
  imageAuth: { fontSize: 8.5, lineHeight: 1.5, textAlign: "justify", marginBottom: 10 },
  closingText: { fontSize: 9, fontFamily: "Helvetica-Bold", textAlign: "justify", marginBottom: 14 },
  row: { flexDirection: "row", marginBottom: 8, alignItems: "center" },
  label: { fontFamily: "Helvetica-Bold", width: 180, fontSize: 9 },
  value: { flex: 1, borderBottomWidth: 1, borderBottomColor: "#333", paddingBottom: 2, fontSize: 9 },
  signatureSection: { marginTop: 8, marginBottom: 14 },
  signatureBox: { width: 200, height: 70, borderWidth: 1, borderColor: "#333", marginTop: 5 },
  signatureImage: { width: 200, height: 70, objectFit: "contain" },
  sectionTitle: { fontFamily: "Helvetica-Bold", fontSize: 10, marginTop: 12, marginBottom: 6, borderBottomWidth: 1, borderBottomColor: "#ccc", paddingBottom: 3 },
  minorCard: { backgroundColor: "#f5f5f5", padding: 8, marginBottom: 6, borderRadius: 4 },
  minorRow: { flexDirection: "row", marginBottom: 3 },
  minorLabel: { fontFamily: "Helvetica-Bold", width: 160, fontSize: 9 },
  minorValue: { flex: 1, fontSize: 9 },
});

const RULES = [
  "No está permitido ingresar a la pista con joyas, piercings faciales ni lentes que puedan desprenderse durante la actividad.",
  "No podrán participar personas con afecciones médicas que puedan poner en riesgo su integridad física o la de terceros durante la actividad.",
  "Está prohibido ingresar a la pista portando objetos afilados o punzocortantes que puedan representar un riesgo para la seguridad propia o de terceros.",
  "Es obligatorio portar el brazalete de color correspondiente que se está realizando la actividad dentro de la pista de patinaje.",
  "El brazalete es personal e intransferible, no se puede compartir el tiempo.",
  "Se debe respetar el orden de las filas de ingreso.",
  "Obligatorio el uso de medias, si no cuenta con medias puedes adquirirlas en el módulo de pago.",
  "Está prohibido el ingreso a la pista sin los implementos de seguridad correspondientes, tales como patines, rodilleras y casco.",
  "Está prohibido patinar tomados de la mano con otra persona o utilizar teléfonos celulares mientras se patina.",
  "Toda persona que ingrese tiene que firmar la declaración de exoneración de responsabilidad por el uso de la pista de patinaje. En caso de menores de edad, el adulto responsable tiene que firmar dicha declaración.",
  "Está prohibido el ingreso de alimentos y/o bebidas en la pista de patinaje.",
  "Perú On Ice no se responsabiliza por la pérdida o extravío de objetos personales.",
  "Está prohibido el ingreso a la pista con bultos grandes tales como mochilas, carteras u otros objetos similares. Asimismo, Perú On Ice no se responsabiliza por el comportamiento o acciones de los clientes durante su turno de patinaje.",
  "Está prohibido empujarse unos con otros, así como también picar el hielo con los patines; teniendo Perú On Ice la facultad de retirar al cliente.",
  "El participante deberá obedecer en todo momento las indicaciones y disposiciones del personal encargado de la pista.",
  "Una vez que el cliente se retire de la pista no puede volver a ingresar por más que su turno siga vigente.",
  "Cualquier comportamiento inapropiado que vaya en contra de las buenas costumbres y moral, será sancionado con el retiro de la pista.",
  "El participante deberá de entregar los patines y los cascos en la zona de recojo una vez terminado su turno.",
];

const LETTERS = "abcdefghijklmnopqr";

const DECLARATIONS = [
  "Declaro expresamente que es mi voluntad participar en las actividades juegos dentro de las instalaciones POI, por lo que mi participación será bajo mi absoluta responsabilidad y asumo todos y cada uno de los riesgos, la responsabilidad por las pérdidas, costos y/o daños que puedan derivarse de dichas actividades.",
  "Acepto y asumo en lo personal todos y cada uno de los riesgos que existen y/o puedan existir en la realización de las actividades citadas. Mi participación en estas actividades es totalmente voluntaria y he decidido participar en las mismas a pesar de los riesgos conocidos y/o desconocidos que ello implica.",
  "Deslindo y libero de toda responsabilidad a POI de cualquier reclamo(s), queja(s), demanda(s), denuncia(s), o acción(es), ya sea individual(es), grupal(es) o colectiva(s), Penal(es), civil(es), administrativa(s) o de cualquier índole, que están relacionadas con mi participación en las actividades de utilización de las instalaciones de POI o el uso de los equipos, relacionados con los riesgos propios de la actividad recreativa.",
  "Acepto de que en caso POI y/o cualquier persona que actúe en su nombre tenga la necesidad de incurrir en gastos de honorarios y costos de abogados para hacer cumplir esta declaración, asumiré en su integridad todos los gastos, costos y honorarios legales, manteniendo indemne a POI por cualquier tipo de reclamación o demanda en términos del párrafo anterior.",
  "Manifiesto que cuento con una póliza de seguro adecuado y suficiente para cubrir cualquier tipo de lesiones, daños o muerte que pudiera sufrir mientras participo en las actividades de POI; y en caso de no tener una póliza con cobertura suficiente, expresamente manifiesto que estoy de acuerdo en asumir en su integridad los costos y gastos derivados de tales lesiones, daños o muerte provocados a mí, o a terceros.",
  "Manifiesto que asumo el riesgo de cualquier afectación física o médica preexistente o no que se pudiera derivar de mi participación en esta actividad.",
  "Confirmo que no he consumido alcohol, drogas o participado en cualquier otra actividad que pueda poner en peligro mi capacidad de participar de manera segura en las actividades en las instalaciones de POI.",
  "Acepto que, si el participante es menor de edad, en mi condición de su representante legal; libero de responsabilidad a POI, por su participación en las actividades en los términos de esta declaración. Igualmente, expresamente acepto mantener indemne a POI por cualquier tipo de reclamación o demanda por daños personales, a la propiedad o de otro tipo que sean generados por, o en nombre del menor de edad, como las que están relacionadas de cualquier manera con el uso o participación del menor de edad en los mismos términos aquí indicados.",
  "Confirmo que suscribo la presente declaración en mi propio nombre de manera libre, voluntariamente y sin coacción alguna por parte de POI.",
  "Acepto expresamente no estar obligado a suscribir una nueva copia de esta declaración antes de cada visita, por lo que expresamente consiento que estoy de acuerdo en que esta declaración podrá ser requerida nuevamente por la empresa en futuras visitas, por mí y/o por los participantes menores de edad que represento.",
  "Adicionalmente, manifiesto expresamente que mis condiciones de salud son idóneas y que carezco de problemas de salud que podrían obstaculizar mi participación en las actividades, juegos y la utilización de la pista de hielo dentro de las instalaciones de POI.",
  "Reconozco y acepto que deberé en todo momento obedecer las instrucciones del personal de POI.",
];

// Read JSON from stdin
const chunks = [];
for await (const chunk of process.stdin) {
  chunks.push(chunk);
}
const data = JSON.parse(Buffer.concat(chunks).toString());

const h = createElement;
const formattedDate = new Date(data.signedAt).toLocaleDateString("es-PE", {
  day: "2-digit", month: "2-digit", year: "numeric",
  timeZone: "America/Lima",
});

const doc = h(Document, null,
  h(Page, { size: "A4", style: styles.page },
    h(Text, { style: styles.title }, "DECLARACIÓN JURADA DE DESLINDE DE RESPONSABILIDADES"),

    h(Text, { style: styles.preamble },
      "Se permite el ingreso a la pista de patinaje a niños a partir de los cinco (5) años de edad y a adultos.\n",
      "Es obligatorio que los niños entre 5 y 9 años ingresen a la pista acompañados por un adulto responsable.\n",
      "Los menores entre 10 y 15 años deberán ingresar bajo la supervisión de un adulto responsable presente en las instalaciones.\n",
      "Los jóvenes entre 16 y 17 años podrán suscribir el presente documento.\n",
      h(Text, { style: styles.boldText }, "El tiempo máximo de permanencia dentro de la pista de patinaje será de una (1) hora por turno.")
    ),

    h(Text, { style: styles.legalText },
      "Declaro expresamente mi voluntad de participar en la actividad de patinaje sobre hielo en la pista instalada en dichas instalaciones de Peru On Ice y manifiesto mi conformidad y aceptación a lo que se señala a continuación tanto a nombre propio como de aquellas personas que están bajo mi custodia y/o respecto a los cuales soy padre y apoderado. En ese sentido:"
    ),

    h(Text, { style: styles.legalText },
      "Con la suscripción de la presente Declaración y en pleno uso de mis facultades manifiesto que ",
      h(Text, { style: styles.boldText }, "reconozco y acepto los riesgos inherentes a la actividad y asumo la responsabilidad derivada de mi participación"),
      ", sin perjuicio de las obligaciones de seguridad que corresponden a la empresa."
    ),

    h(Text, { style: styles.legalText },
      'PERU ON ICE con RUC 20613509446, sus agentes, representantes, propietarios, socios, accionistas, funcionarios, directores generales, afiliados, administradores, consejeros, colaboradores, auxiliares, usuarios, empleados, personal apoyo, voluntarios, fabricantes, participantes, arrendadores, subsidiarias, entidades relacionadas, franquiciantes, franquiciados, y todas aquellas personas o entidades que actúan con cualquier capacidad en su nombre o representación (todos en adelante y de manera conjunta "POI"), en mi nombre y en nombre de mis hijos o apoderados menores de edad de la siguiente manera:'
    ),

    h(Text, { style: styles.numberedItem },
      h(Text, { style: styles.boldText }, "1."),
      " Reconozco y tengo pleno conocimiento y considerando que se me ha informado correcta, oportuna y de manera indubitable, que las actividades, juegos y la utilización de los juegos dentro de las instalaciones de POI implican la asunción de ciertos riesgos y peligros que existen y sobre los cuales se me ha informado claramente, que podrían resultar en lesiones físicas o emocionales, parálisis (total o parcial), muerte o daños a mi persona, a la propiedad o a terceros. Asimismo, reconozco expresamente que se me ha explicado que dichos riesgos y peligros no pueden ser eliminados, ya sea parcial o totalmente de dichas actividades, sin que se vea afectada la naturaleza de las mismas, las cuales estoy dispuesto(a) a realizar; asumiendo conscientemente el riesgo implícito en la realización de dichas actividades."
    ),

    h(Text, { style: styles.numberedItem },
      h(Text, { style: styles.boldText }, "2."),
      " Me obligo a cumplir las siguientes Reglas Generales del uso del servicio:"
    ),

    ...RULES.map((rule, i) =>
      h(Text, { key: `r${i}`, style: styles.subItem }, `${LETTERS[i]}) ${rule}`)
    ),

    h(Text, { style: styles.numberedItem },
      h(Text, { style: styles.boldText }, "3."),
      " Adicionalmente tengo pleno conocimiento que los riesgos inherentes a estas actividades incluyen, entre otros, señalados de manera enunciativa más no limitativa:\n",
      "a) Los participantes usualmente caen, sufriendo contusiones, distensiones, dislocaciones, cortadas, raspones, fricciones, quemaduras y/o hematomas, así como otras lesiones más serias, como esguinces, fracturas de muñecas, tobillos, piernas, o cualquier otra parte del cuerpo, lesiones en el cuello o en la cabeza, golpes en la región cráneo encefálica, parálisis o la muerte.\n",
      "b) Girar, voltear, correr, saltar en la pista de patinaje constituye una actividad peligrosa, que puede causar lesiones graves al participante y/o a otros participantes; por lo que de hacerlo, será bajo la estricta responsabilidad del participante."
    ),

    h(Text, { style: styles.legalText },
      "En cualquiera de estas circunstancias, en el caso de que el participante o sus hijos menores de edad se lesionen y requieren asistencia médica, los gastos deberán ser asumidos por el participante o su representante legal, ",
      h(Text, { style: styles.boldText }, "salvo que se determine responsabilidad atribuible a la empresa conforme a la normativa vigente"),
      "."
    ),

    h(Text, { style: styles.numberedItem },
      h(Text, { style: styles.boldText }, "4."),
      " Reconozco, tengo pleno conocimiento y acepto que los empleados de POI tienen una labor difícil de ejecutar y harán su mejor esfuerzo para proporcionar los más altos estándares de seguridad de todos los participantes. Sin embargo, los empleados no son infalibles. Está fuera del alcance de los empleados de POI tener conocimiento del estado de salud, condición médica y las habilidades de cada uno de los participantes. En consecuencia de manera expresa y voluntaria:"
    ),

    ...DECLARATIONS.map((decl, i) =>
      h(Text, { key: `d${i}`, style: styles.subItem }, `${LETTERS[i]}) ${decl}`)
    ),

    h(Text, { style: styles.signConformity },
      "Con la suscripción de la presente declaración, manifiesto expresamente que tuve oportunidad de leer su contenido completo; que lo entiendo; que comprendo sus alcances; que he sido informado correcta y oportunamente sobre los riesgos que se pueden presentar con mi participación en las actividades aquí descritas. En consecuencia, asumo con pleno conocimiento de causa la responsabilidad por todos los daños y perjuicios ocasionados por mí o por alguno(s) de mi(s) hijo(s) menor(es) de edad, de los que firmo como responsable frente a terceras personas, participantes, empleados de POI y/o de las instalaciones de POI para la cual responderé en lo personal; desligando, liberando de cualquier responsabilidad a POI y manteniendo indemne a POI en todo momento."
    ),

    h(Text, { style: styles.closingText },
      "El participante se compromete a cumplir las normas de seguridad establecidas por la empresa y las instrucciones del personal encargado de la pista, con la finalidad de prevenir accidentes y garantizar la seguridad de todos los usuarios."
    ),

    h(Text, { style: styles.imageAuth },
      'Por el presente documento yo autorizo a Perú On Ice, con RUC 20613509446 y con domicilio en La Rosa Toro 1250, distrito de San Borja (Lima) a utilizar las imágenes de las que son parte yo y mis familiares y que se registraron en las fotos y/o videos efectuados el día de hoy, conforme a lo señalado en el artículo 15° del Código Civil peruano. Por lo tanto, autorizo su utilización y aprovechamiento para fines publicitarios, en general, para su difusión en actividades, intereses o funciones de Perú On Ice en todo medio, sin limitaciones en el número de su uso, durante dos (2) años a partir de su primera exposición en medios masivos.'
    ),

    h(Text, { style: { fontSize: 9, fontFamily: "Helvetica-Bold", textAlign: "center", marginBottom: 16 } },
      "Leída en su totalidad la presente declaración, y enterado(a) con su contenido y alcances legales, la firmo en señal de conformidad."
    ),

    h(View, { style: styles.row },
      h(Text, { style: styles.label }, "FECHA:"),
      h(Text, { style: styles.value }, formattedDate)
    ),

    h(View, { style: styles.signatureSection },
      h(Text, { style: styles.label }, "FIRMA:"),
      data.signatureBase64
        ? h(Image, { src: data.signatureBase64, style: styles.signatureImage })
        : h(View, { style: styles.signatureBox })
    ),

    h(Text, { style: styles.sectionTitle }, "ADULTO RESPONSABLE"),

    h(View, { style: styles.row },
      h(Text, { style: styles.label }, "NOMBRE COMPLETO:"),
      h(Text, { style: styles.value }, data.adultName)
    ),
    h(View, { style: styles.row },
      h(Text, { style: styles.label }, "DOCUMENTO DE IDENTIDAD:"),
      h(Text, { style: styles.value }, data.adultDni)
    ),
    h(View, { style: styles.row },
      h(Text, { style: styles.label }, "EDAD:"),
      h(Text, { style: styles.value }, data.adultAge ? `${data.adultAge} años` : "-")
    ),

    ...(data.minors.length > 0 ? [
      h(Text, { key: "mt", style: styles.sectionTitle }, "MENORES"),
      ...data.minors.map((minor, i) =>
        h(View, { key: `m${i}`, style: styles.minorCard },
          h(View, { style: styles.minorRow },
            h(Text, { style: styles.minorLabel }, "NOMBRE COMPLETO DEL MENOR:"),
            h(Text, { style: styles.minorValue }, minor.minor_name)
          ),
          h(View, { style: styles.minorRow },
            h(Text, { style: styles.minorLabel }, "DOCUMENTO DE IDENTIDAD:"),
            h(Text, { style: styles.minorValue }, minor.minor_dni || "-")
          ),
          h(View, { style: styles.minorRow },
            h(Text, { style: styles.minorLabel }, "EDAD:"),
            h(Text, { style: styles.minorValue }, `${minor.minor_age} años`)
          )
        )
      )
    ] : [])
  )
);

const buffer = await renderToBuffer(doc);
process.stdout.write(Buffer.from(buffer));
