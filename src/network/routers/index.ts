import SessionRouter from './SessionRouter';

import BarberClientAppointmentsRouter from './crud/BarberClientAppointmentsRouter';

import BarbershopProfileRouter from './crud/BarbershopProfileRouter';
import BarberServicesRouter from './crud/BarbershopServicesRouter';
import BarbershopAppointmentsRouter from './crud/BarbershopAppointmentsRouter';

import AppointmentsFinderRouter from './retrievers/AppointmentsFinderRouter';
import BarbershopServiceFinder from './retrievers/BarbershopServiceFinder';
import BarbershopProfileFinder from './retrievers/BarbershopProfileFinder';

export default {
    SessionRouter,

    BarberClientAppointmentsRouter,

    BarbershopProfileRouter,
    BarberServicesRouter,
    BarbershopAppointmentsRouter,

    AppointmentsFinderRouter,
    BarbershopServiceFinder,
    BarbershopProfileFinder,
};
