<script setup>
import { useCounterStore } from '@/stores/counter';
import { useDate } from 'vuetify/lib/framework.mjs';
import { ref, computed, onBeforeMount } from 'vue';

const DATE = useDate();
const store = useCounterStore();

const CONFIG = ref({
    horas_por_dia: "",
    min_por_dia: 0,
    intervalos: [
        {
            id: "01",
            entrada: "",
            entradaTime: 0,
            saida: "",
            saidaTime: 0,
            total_intervalo: 0,
            formatedEntrada: null,
            formatedSaida: null,
        },
        {
            id: "02",
            entrada: "",
            entradaTime: 0,
            saida: "",
            saidaTime: 0,
            total_intervalo: 0,
            formatedEntrada: null,
            formatedSaida: null,
        },
    ],
});

onBeforeMount(() => {
    CONFIG.value.intervalos.forEach(inter => {
        inter.formatedEntrada = useFormattedTime(inter.id, 'entrada');
        inter.formatedSaida = useFormattedTime(inter.id, 'saida');
        inter.total_intervalo = useCountInterval(inter.id);
    });
})

function useFormattedTime(id, type) {
    return computed(() => {
        let TIME = `${CONFIG.value.intervalos.filter(i => i.id === id)[0][`${type}`]}`.replace(/\D/g, '');
        if (TIME.length===4) {
            
        }
        CONFIG.value.intervalos.filter(i => i.id === id)[0][`${type}`] = TIME.replace(/(\d{2})(\d)/, '$1:$2');

        let [hora, min, seg] = CONFIG.value.intervalos.filter(i => i.id === id)[0][`${type}`].split(":");

        if (hora !== undefined) {
            if (hora.length === 1) {
                hora = hora.replace(/[^0-2]/g, '');
            } else {
                if (hora.split("")[0] == "2") {
                    hora = `${hora.split("")[0]}${hora.split("")[1].replace(/[^0-3]/g, '')}`
                }
            }
        }
        
        if (min !== undefined) {
            if (min.length === 1) {
                min = min.replace(/[^0-5]/g, '');
            }
        }
        
        CONFIG.value.intervalos.filter(i => i.id === id)[0][`${type}`] = `${hora !== undefined ? hora : ""}${min !== undefined && min!=="" ? (min.length>1 ? min[0]+min[1] : min[0]) : ""}`.replace(/(\d{2})(\d)/, '$1:$2');

        if (CONFIG.value.intervalos.filter(i => i.id === id)[0][`${type}`].length === 5) {
            const timeArray = CONFIG.value.intervalos.filter(i => i.id === id)[0][`${type}`].split(":");
            CONFIG.value.intervalos.filter(i => i.id === id)[0][`${type}Time`] = new Date().setHours(parseInt(timeArray[0]), parseInt(timeArray[1]), 0, 0);
        } else {
            CONFIG.value.intervalos.filter(i => i.id === id)[0][`${type}Time`] = 0;
        }

        return CONFIG.value.intervalos.filter(i => i.id === id)[0][`${type}`]
    });
}

function useCountInterval(id) {
    return computed(() => {
        if (CONFIG.value.intervalos.filter(i => i.id === id)[0].entrada.length === 5 && CONFIG.value.intervalos.filter(i => i.id === id)[0].saida.length === 5) {
            const entradaArray = CONFIG.value.intervalos.filter(i => i.id === id)[0].entrada.split(":");
            const saidaArray = CONFIG.value.intervalos.filter(i => i.id === id)[0].saida.split(":");

            const entrada = new Date(new Date().setHours(parseInt(entradaArray[0]), parseInt(entradaArray[1]), 0, 0));
            const saida = new Date(new Date().setHours(parseInt(saidaArray[0]), parseInt(saidaArray[1]), 0, 0));

            return (DATE.getDiff(saida, entrada) / 1000 / 60);
        }

        return 0;

    });
}

const countJornada = ref(0);
const countHorasRestante = ref("")

function Jornada() {
    const intervalosFiltrado = CONFIG.value.intervalos.filter(inter => inter.entrada.length === 5 && inter.entradaTime <= new Date().getTime());

    if (intervalosFiltrado.length > 0) {

        let minConcluidos = 0;

        if (intervalosFiltrado[intervalosFiltrado.length - 1].total_intervalo === 0 || (intervalosFiltrado[intervalosFiltrado.length - 1].total_intervalo > 0 && intervalosFiltrado[intervalosFiltrado.length - 1].saidaTime > new Date().getTime())) {
            const entradaArray = intervalosFiltrado[intervalosFiltrado.length - 1].entrada.split(":");
            minConcluidos = DATE.getDiff(new Date(new Date().setSeconds(0, 0)), new Date(new Date().setHours(parseInt(entradaArray[0]), parseInt(entradaArray[1]), 0, 0))) / 1000 / 60;
        }

        if (intervalosFiltrado.filter(int => int.total_intervalo > 0).length > 0) {
            intervalosFiltrado.filter(int => int.total_intervalo > 0).forEach(i => {
                if (i.saidaTime <= new Date().getTime()) {
                    minConcluidos += i.total_intervalo;
                }
            });
        }

        const minFaltante = parseInt(CONFIG.value.min_por_dia) - minConcluidos;

        const hora = `${parseInt(minFaltante/60) < 10 ? '0' : ''}${parseInt(minFaltante/60)}`;
        // const m = 60 * (horasFaltante - parseInt(horasFaltante))
        const m = minFaltante % 60
        const minutos = `${m < 10 ? '0' : ''}${Math.round(m)}`;

        return {
            jornada: minConcluidos,
            restante: minConcluidos < parseInt(CONFIG.value.min_por_dia) ? `${hora}:${minutos}` : "00:00"
        };
    }

    return {
        jornada: 0,
        restante: CONFIG.value.horas_por_dia === "" && !parseInt(CONFIG.value.horas_por_dia) ? "00:00" : `${parseInt(CONFIG.value.horas_por_dia) < 10 ? '0' : ''}${parseInt(CONFIG.value.horas_por_dia)}:00`
    };
}

function Hora() {

    const intervalos = CONFIG.value.intervalos;
    let minFaltante = parseInt(CONFIG.value.min_por_dia);

    if (intervalos[intervalos.length - 1].entrada.length === 5) {
        const entradaArray = intervalos[intervalos.length - 1].entrada.split(":");

        CONFIG.value.intervalos.filter(inter => inter.total_intervalo > 0).forEach(element => {
            // if (element.saidaTime <= new Date().getTime()) {
                minFaltante -= element.total_intervalo;
            // }
        });


        const horaFinal = DATE.addMinutes(new Date(new Date().setHours(parseInt(entradaArray[0]), parseInt(entradaArray[1]), 0, 0)), minFaltante);

        if (minFaltante <= 0) {
            return intervalos[intervalos.length - 1].saida;
        }

        return new Date(horaFinal).toLocaleTimeString();
    }

    return "";
}

function startJornada() {
    const { jornada, restante } = Jornada();
    countJornada.value = jornada / (parseInt(CONFIG.value.min_por_dia) / 100);;
    countHorasRestante.value = restante;
    CONFIG.value.intervalos[CONFIG.value.intervalos.length - 1].saida = Hora();
}

function addInterval() {
    CONFIG.value.intervalos[CONFIG.value.intervalos.length - 1].saida = "";
    const idInterval = Date.now();
    const interval = {
        id: idInterval,
        entrada: "",
        entradaTime: 0,
        saida: "",
        saidaTime: 0,
        total_intervalo: useCountInterval(idInterval),
        formatedEntrada: useFormattedTime(idInterval, 'entrada'),
        formatedSaida: useFormattedTime(idInterval, 'saida'),
    }
    CONFIG.value.intervalos.push(interval);
}

function removeInterval(idInterval) {
    CONFIG.value.intervalos = CONFIG.value.intervalos.filter(inter => inter.id !== idInterval);
}

startJornada();
setInterval(startJornada, 1000);

const disabledEntrada = computed(() => {
    if (CONFIG.value.horas_por_dia === "") {
        return true
    }
    return false
});

const disabledSaida = computed(() => {
    if (CONFIG.value.horas_por_dia === "") {
        return true
    }
    return false
});

function formateMinutes() {
    if (CONFIG.value.horas_por_dia!==""&&parseInt(CONFIG.value.horas_por_dia)) {
        CONFIG.value.min_por_dia = parseInt(CONFIG.value.horas_por_dia) * 60;
    } else {
        CONFIG.value.min_por_dia = 0;
    }
}

const formatHorasPorDia = computed(()=>{
    const h = CONFIG.value.horas_por_dia.replace(/\D/g, '');
    CONFIG.value.horas_por_dia = `${h}`;
    return CONFIG.value.horas_por_dia;
});

</script>

<template>
    <v-app :theme="store.theme">
        <v-main class="pa-4 px-15 border">
            <v-row dense style="" class="pt-5 pb-16 mb-16 px-10">

                <v-col cols="2"></v-col>

                <!-- Main -->
                <v-col cols="7" class="mx-auto">
                    <v-card>
                        <v-card-text class="my-3">
                            <v-row dense class="mx-auto">
                                <v-col cols="11" class="text-center mb-6 mx-auto">
                                    <h1>Ponto +/-</h1>
                                </v-col>
                            </v-row>
                            <v-row dense class="mx-auto">
                                <v-col cols="11" class="text-center mx-auto d-flex align-center">
                                    <v-text-field v-model="CONFIG.horas_por_dia" :model-value="formatHorasPorDia" :on-update:model-value="formateMinutes()" density="comfortable"
                                        variant="outlined" color="green" maxlength="5" label="Horas por dia"
                                        prepend-inner-icon="mdi-clock-outline" hide-details>
                                        <template v-slot:append-inner>
                                            <v-icon icon="mdi-help-box" style="cursor: pointer;"></v-icon>
                                            <v-tooltip location="right top" activator="parent" style="margin-left: 1rem !important;">
                                                Informe a quantidade de <br> horas trabalhadas por dia, <br> exemplo: 8
                                            </v-tooltip>
                                        </template>
                                    </v-text-field>
                                </v-col>
                                <v-col cols="11" class="mx-auto my-2">
                                    <v-divider></v-divider>
                                </v-col>
                            </v-row>
                            <v-row v-for="inter, index in CONFIG.intervalos" :key="inter.id" dense class="mx-auto">
                                <v-col cols="5" class="ml-auto d-flex align-center">
                                    <v-text-field density="comfortable" variant="outlined" color="green"
                                        v-model="inter.entrada" :model-value="inter.formatedEntrada" maxlength="5"
                                        label="Entrada" prepend-inner-icon="mdi-login" hide-details
                                        placeholder="23:59"
                                        :disabled="disabledEntrada || (index > 0 && CONFIG.intervalos[index - 1].saidaTime === 0) || (index < CONFIG.intervalos.length - 1 && inter.saidaTime > 0) ? true : false"></v-text-field>
                                </v-col>
                                <v-col cols="5" class="d-flex align-center">
                                    <v-text-field density="comfortable" variant="outlined" color="green"
                                        v-model="inter.saida" :model-value="inter.formatedSaida" maxlength="5"
                                        label="Saída" prepend-inner-icon="mdi-logout" placeholder="23:59"
                                        :disabled="index === CONFIG.intervalos.length - 1 || disabledSaida || inter.entradaTime === 0 || CONFIG.intervalos[index + 1].entradaTime > 0 ? true : false"
                                        hide-details></v-text-field>
                                </v-col>
                                <v-col cols="1" class="text-center mr-auto d-flex align-center">
                                    <v-btn @click="removeInterval(inter.id)" class="mx-auto" icon="mdi-trash-can"
                                        color="red" size="46" variant="tonal" style="border-radius: 5px;"
                                        :disabled="CONFIG.intervalos.length > 2 ? false : true"></v-btn>
                                </v-col>
                                <v-col v-if="index < CONFIG.intervalos.length - 1" cols="11"
                                    class="text-center mx-auto my-2">
                                    <v-divider></v-divider>
                                </v-col>
                            </v-row>
                            <v-row dense class="mx-auto mt-5">
                                <v-col cols="11" class="text-center mx-auto">
                                    <v-btn @click="addInterval()" class="w-50 mx-auto" color="green" variant="tonal"
                                        text="Adicionar Intervalo">
                                        <template v-slot:prepend>
                                            <v-icon>mdi-plus</v-icon>
                                        </template>
                                    </v-btn>
                                </v-col>
                            </v-row>
                        </v-card-text>
                    </v-card>
                    <v-row dense class="mx-auto">
                        <v-col cols="12" class="mt-10 mx-auto">
                            <v-progress-linear class="w-100 rounded-lg" :model-value="countJornada" :height="8"
                                color="green"></v-progress-linear>
                            <div class="d-flex align-center w-100">
                                <p class="mt-2 opacity-70 text-left">Contador de Jornada</p>
                                <v-spacer></v-spacer>
                                <p class="mt-2 opacity-70 text-right">{{ countHorasRestante }}h restantes</p>
                            </div>
                        </v-col>
                    </v-row>

                </v-col>

                <v-col cols="2"></v-col>

            </v-row>



        </v-main>
        <div class="text-center border rounded-xl px-6 py-5 align-center d-flex ga-2"
            style="position: absolute; bottom: 2rem; align-self: center;" cols="12">
            <p class="opacity-70" style="font-family: cursive !important; font-weight: 100; font-size: small;">{{ new
                Date().getFullYear() }} - Lucas Berriel</p>
            <a class="opacity-70" href="https://github.com/berrielucas"><v-icon>mdi-github</v-icon></a>
            <a class="opacity-70" href="https://www.linkedin.com/in/lucas-berriel/"><v-icon>mdi-linkedin</v-icon></a>
        </div>
    </v-app>
</template>
