const start = document.querySelector('.btn-start');
const [densidadActual, viaArea, resFinal, timeCheck, mensajeFestivo] = ["densidadActual", "viaAerea", "resultadoFinal", "ritmo", "mensajeFestivo"].map((el) => { return document.getElementById(el) })
const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay))

start.addEventListener('click', async () => {
    const timeStep = 900

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
            console.log(date.toDateString().includes(holiday))
            if (date.toDateString().includes(holiday)) return true;
            else return false;
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

    const endDate = new Date(document.getElementById('endDate').value).getTime() / 1000

    const viaNS = new Via(false)
    const viaSN = new Via(true)
    const aerea = new Aerea()

    while (date.time < endDate) {
        let festividad = false
        for (holiday of festividades) {
            festividad = date.isHoliday(holiday.fecha)
            if (festividad) {
                mensajeFestivo.innerText = "¡Feliz " + holiday.descripcion + "!"
                break
            }
        }

        viaNS.variarDensidad(viaNS.entrarHoraPico(date.time), 125, festividad, aerea)
        viaSN.variarDensidad(viaSN.entrarHoraPico(date.time), 125, festividad, aerea)
        viaNS.revisarEmbotellamiento()
        viaSN.revisarEmbotellamiento()
        const htmlDensidad = `
            <p>
                La densidad actual en la vía con dirección al ${viaNS.direccion} es ${viaNS.densidadVehicular}
            </p>
            <p>
                La densidad actual en la vía con dirección al ${viaSN.direccion} es ${viaSN.densidadVehicular}
            </p>
                `

        densidadActual.innerHTML = htmlDensidad

        const preparacionAerea = (aerea.direccion == "Cambiando") ? `La vía aérea está cambiando de dirección y lleva ${aerea.cooldown / 60}m.` : "La vía aérea está abierta."
        const htmlAerea = `
            <p> Dirección actual de la vía aérea: ${aerea.direccion}</p>
            <p> Densidad actual en la vía aérea: ${aerea.densidadVehicular}</p>
            <p> ${preparacionAerea} </p>
        `
        viaArea.innerHTML = htmlAerea

        if (viaNS.densidadVehicular >= 125) {
            aerea.escogerDireccion(viaNS)
        } else if (viaSN.densidadVehicular >= 125) {
            aerea.escogerDireccion(viaSN)
        }
        if (timeCheck.checked) {
            await sleep(250)
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
})