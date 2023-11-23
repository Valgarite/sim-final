const tope = 125;

const circulacion = {
    "norteSur": {
        "diasHabiles": {
            "mañana": ["06:00", "09:00", 119],
            "tarde": ["11:30", "13:00", 105],
            "noche": ["17:00", "19:30", 120]
        },
        "finDeSemana": {
            "mañana": ["06:00", "13:00", 80],
            "tarde": ["13:00", "15:00", 107],
            "noche": ["15:00", "20:00", 80]
        },
    },
    "surNorte": {
        "diasHabiles": {
            "mañana": ["06:00", "09:00", 117],
            "tarde": ["11:30", "13:00", 98],
            "noche": ["17:00", "21:15", 76]
        },
        "finDeSemana": {
            "mañana": ["04:30", "07:00", 54],
            "tarde": ["07:00", "09:30", 105],
            "noche": ["09:30", "20:00", 54]
        },
    }
}

const eventosDetienenTransito = [
    "Mantenimiento Áreas Verdes",
    "Mantenimiento Sistemas Eléctricos",
    "Reparaciones menores en vía",
    "Colisiones Varias",
    "Cierres Preventivos",
    "Manifestaciones Generales (Colectividad y sectores Particulares)"
];

class Via {
    constructor(direccionNorte) {
        this.densidadVehicular = 0
        this.embotellamientos = 0
        this.aperturas = 0
        if (direccionNorte) {
            this.direccion = "Norte"
        } else if (!direccionNorte) {
            this.direccion = "Sur"
        }
    }
    variarDensidad(minimo, maximo, festivo, aerea) {
        const densidadAleatoria = !festivo ? random(minimo, maximo) : random(tope, maximo)
        if (this.direccion == aerea.direccion) {
            this.densidadVehicular = densidadAleatoria * 0.6
            aerea.densidadVehicular = densidadAleatoria * 0.4
        } else {
            this.densidadVehicular = densidadAleatoria
        }
    }
    entrarHoraPico(unixTimestamp) {
        const direccion = this.direccion == "Norte" ? "norteSur" : "surNorte"
        const fecha = new Date(unixTimestamp * 1000);

        // Día hábil o fin de semana
        const diaDeLaSemana = fecha.getDay();
        const esFinDeSemana = diaDeLaSemana === 0 || diaDeLaSemana === 6;
        const tipoDia = esFinDeSemana ? "finDeSemana" : "diasHabiles";

        // Hora y minutos de la fecha
        const horaActual = fecha.getHours();
        const minutosActuales = fecha.getMinutes();
        const totalMinutosActuales = horaActual * 60 + minutosActuales;

        for (const rango in circulacion[direccion][tipoDia]) {
            const [horaInicio, horaFin, valor] = circulacion[direccion][tipoDia][rango];

            const [horaInicioH, horaInicioM] = horaInicio.split(':').map(Number);
            const [horaFinH, horaFinM] = horaFin.split(':').map(Number);
            const totalMinutosInicio = horaInicioH * 60 + horaInicioM;
            const totalMinutosFin = horaFinH * 60 + horaFinM;

            if (totalMinutosActuales >= totalMinutosInicio && totalMinutosActuales <= totalMinutosFin) {
                return valor;
            }
        }
        return 1;
    }
    contarApertura() {
        this.aperturas++
    }
    revisarEmbotellamiento() {
        if (this.densidadVehicular >= tope) {
            this.embotellamientos++
        }
    }
    reportesFinales() {
        return { embotellamientos: this.embotellamientos, aperturas: this.aperturas }
    }
}

class Aerea {
    constructor() {
        this.cooldown = 7200
        this.direccion = "Cerrada"
        this.densidadVehicular = 0
        this.proximaDireccion = "Norte"
    }
    escogerDireccion(via, festivo) {
        if (!festivo) {
            if (this.direccion != via.direccion) {
                if (this.direccion != "Cambiando") {
                    this.cooldown = 0
                    this.densidadVehicular = 0
                    this.proximaDireccion = via.direccion
                }
                this.direccion = "Cambiando"
                via.contarApertura()
            }
        } else {
            this.direccion = "Sur"
        }
    }
    enfriar(tiempo) {
        this.cooldown += tiempo
        if (this.cooldown >= 7200) {
            this.direccion = this.proximaDireccion
        }
    }
}

function random(min, max) {
    return Math.floor((Math.random() * (max - min + 1)) + min);
}
