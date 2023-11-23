const start = document.querySelector('.btn-start');
const res = document.getElementById('res');
const [densidadActual, viaArea, resFinal, timeCheck, mensajeFestivo, momento] = ["densidadActual", "viaAerea", "resultadoFinal", "ritmo", "mensajeFestivo", "momento"].map((el) => { return document.getElementById(el) })
const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))

start.addEventListener('click', async () => {

    res.setAttribute('class', 'flex column container container__results');

    const timeStep = 900
    resFinal.innerHTML = ""

    const date = {
        time: new Date(document.getElementById('initialDate').value).getTime() / 1000,
        addHours() {
            this.time += 3600;
        },
        addMinutes() {
            this.time += 60;
        },
        addSeconds() {
            this.time += 1;
        },
        forwardStep() {
            this.time += timeStep
        },
        isHoliday(holiday) {
            const date = new Date(this.time * 1000);
            const formattedDate = `${date.toLocaleString('en-US', { month: 'short' })} ${date.getDate()}`

            return formattedDate === holiday;
        }

    }
    const festividades = [
        { "fecha": "Jan 01", "descripcion": "Año Nuevo" },
        { "fecha": "Apr 19", "descripcion": "Declaración de la Independencia" },
        { "fecha": "May 01", "descripcion": "Día del Trabajo" },
        { "fecha": "Jun 24", "descripcion": "Batalla de Carabobo" },
        { "fecha": "Jul 05", "descripcion": "Día de la Independencia" },
        { "fecha": "Jul 24", "descripcion": "Natalicio de Simón Bolívar" },
        { "fecha": "Oct 12", "descripcion": "Día de la Resistencia Indígena" },
        { "fecha": "Dec 24", "descripcion": "Víspera de Navidad" },
        { "fecha": "Dec 25", "descripcion": "Navidad" },
        { "fecha": "Dec 31", "descripcion": "Fiesta de Fin de Año" }
    ];
    const festInfo = () => {
        for (holiday of festividades) {
            festividad = date.isHoliday(holiday.fecha)
            if (festividad) {
                return holiday.descripcion
            }
        }
    }

    const endDate = new Date(document.getElementById('endDate').value).getTime() / 1000

    if (endDate >= date.time + 900) {
        const viaNS = new Via(false)
        const viaSN = new Via(true)
        const aerea = new Aerea()

        while (date.time < endDate) {
            const festividad = festInfo()
            if (festividad) {
                mensajeFestivo.innerText = "¡Feliz " + holiday.descripcion + "!"
            }

            viaNS.variarDensidad(viaNS.entrarHoraPico(date.time), 125, festividad, aerea)
            viaSN.variarDensidad(viaSN.entrarHoraPico(date.time), 125, festividad, aerea)
            viaNS.revisarEmbotellamiento()
            viaSN.revisarEmbotellamiento()

            momento.innerText = `Simulacion hecha en: ${new Date(date.time * 1000).toLocaleString('es-US')}`

            const htmlDensidad = `
            <p>
                La densidad actual en la vía con dirección al ${viaNS.direccion} es ${Math.round(viaNS.densidadVehicular)}
            </p>
            <p>
                La densidad actual en la vía con dirección al ${viaSN.direccion} es ${Math.round(viaSN.densidadVehicular)}
            </p>
                `

            densidadActual.innerHTML = htmlDensidad

            const preparacionAerea = (aerea.direccion == "Cambiando") ? `La vía aérea está cambiando de dirección y lleva ${aerea.cooldown / 60}m.` : "La vía aérea está abierta."
            const htmlAerea = `
            <p> Dirección actual de la vía aérea: ${aerea.direccion}</p>
            <p> Densidad actual en la vía aérea: ${Math.round(aerea.densidadVehicular)}</p>
            <p> ${preparacionAerea} </p>
        `
            viaArea.innerHTML = htmlAerea

            if (viaNS.densidadVehicular >= 125) {
                aerea.escogerDireccion(viaNS, festividad)
            } else if (viaSN.densidadVehicular >= 125) {
                aerea.escogerDireccion(viaSN, festividad)
            }
            if (timeCheck.checked) {
                await sleep(500)
            }
            date.forwardStep();
            aerea.enfriar(timeStep)
        }

        const [reporteNS, reporteSN] = [viaNS, viaSN].map((el) => { return el.reportesFinales() })
        const htmlReporte = `
        <p>Embotellamientos en vía con dirección al ${viaSN.direccion}: ${reporteSN.embotellamientos}</p>
        <p>Veces que se abrió la vía aérea con dirección al: ${viaSN.direccion}: ${reporteSN.aperturas}</p>
        <p>Embotellamientos en vía con dirección al: ${viaNS.direccion}: ${reporteNS.embotellamientos}</p>
        <p>Veces que se abrió la vía aérea con dirección al: ${viaNS.direccion}: ${reporteNS.aperturas}</p>
    `
        resFinal.innerHTML = htmlReporte
    } else {
        resFinal.innerHTML = `La fecha de fin tiene que ser mayor a la de inicio por un minimo de 15 minutos.`;
    }
}
)
