import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import './styles.css';
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import logo from '../../assets/logo.svg';
import { Map, TileLayer, Marker } from 'react-leaflet';
import api from '../../services/api';
import axios from 'axios';
import { LeafletMouseEvent } from 'leaflet';
import Dropzone from './../../components/Dropzone';

interface Service {
    id: number,
    title: string,
    image: string
}

interface IBGEUFResponse {
    sigla: string;
}

interface IBGECityResponse {
    nome: string;
}


const CreatePoint = () => {

    const [services, setItems] = useState<Service[]>([]);
    const [ufs, setUfs] = useState<string[]>([]);
    const [cities, setCities] = useState<string[]>([]);
    const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0]);


    const [selectedUf, setSelectedUf] = useState('0');
    const [selectedCity, setSelectedCity] = useState('0');
    const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0]);
    const [selectedFile, setSelectedFile] = useState<File>();


    const [formData, setFormData] = useState({
        name: '',
        email: '',
        whatsapp: ''
    });

    const [selectedServices, setSelectedServices] = useState<number[]>([]);

    const history = useHistory();


    useEffect(() => {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            setInitialPosition([latitude, longitude]);
        })
    })

    useEffect(() => {
        api.get('services')
            .then(response => {
                setItems(response.data);
            }
            )
    }, []);

    useEffect(() => {
        axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
            .then(response => {
                const ufInitials = response.data.map(uf => uf.sigla);
                setUfs(ufInitials);
            }
            )
    }, []);

    useEffect(() => {
        if (selectedUf === '0') {
            return;
        }

        axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`)
            .then(response => {
                const cityNames = response.data.map(city => city.nome);
                setCities(cityNames);
            }
            )
    }, [selectedUf]);

    function handleSelectUfs(event: ChangeEvent<HTMLSelectElement>) {
        const selectedUf = event.target.value;
        setSelectedUf(selectedUf);
    }

    function handleSelectCity(event: ChangeEvent<HTMLSelectElement>) {
        const selectedCity = event.target.value;
        setSelectedCity(selectedCity);
    }

    function handleMapClick(event: LeafletMouseEvent) {
        setSelectedPosition([
            event.latlng.lat,
            event.latlng.lng
        ]);
    }

    function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
        const { name, value } = event.target;

        setFormData({
            ...formData,
            [name]: value
        })
    }

    function handleSelectService(id: number) {
        const alreadySelected = selectedServices.findIndex(service => service === id);
        if (alreadySelected >= 0) {
            const filteredServices = selectedServices.filter(service => service !== id)
            setSelectedServices(filteredServices);
        } else {
            setSelectedServices([...selectedServices, id]);
        }
    }

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();

        const { name, email, whatsapp } = formData;
        const uf = selectedUf;
        const city = selectedCity
        const [latitude, longitude] = selectedPosition;
        const services = selectedServices;

        const data = new FormData();

        data.append('name', name)
        data.append('email', email)
        data.append('whatsapp', whatsapp)
        data.append('uf', uf)
        data.append('city', city)
        data.append('latitude', String(latitude))
        data.append('longitude', String(longitude))
        data.append('services', services.join(','));
        
        if (selectedFile){
            data.append('image', selectedFile);
        }
        
        await api.post('points', data);

        alert('Ponto criado');

        history.push('/');
    }

    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Find a Maker" />

                <Link to='/'>
                    <FiArrowLeft /> Voltar para home
                </Link>
            </header>

            <form onSubmit={handleSubmit}>
                <h1>Cadastro do ponto</h1>

                <Dropzone onFileUploaded={setSelectedFile} />

                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>

                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">E-mail</label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="field">
                            <label htmlFor="whatsapp">Whatsapp</label>
                            <input
                                type="text"
                                name="whatsapp"
                                id="whatsapp"
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>

                    <Map center={initialPosition} zoom={15} onClick={handleMapClick}>
                        <TileLayer
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />

                        <Marker position={selectedPosition} />
                    </Map>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado (UF)</label>
                            <select
                                name="uf"
                                id="uf"
                                value={selectedUf}
                                onChange={handleSelectUfs}
                            >
                                <option value="0">Selecione uma UF</option>
                                {ufs.map(uf => (
                                    <option key={uf} value={uf}> {uf} </option>
                                ))}
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select
                                name="city"
                                id="city"
                                value={selectedCity}
                                onChange={handleSelectCity}
                            >
                                <option value="0">Selecione uma cidade</option>
                                {cities
                                    .map(city => (
                                        <option key={city} value={city}>{city}</option>
                                    ))
                                }
                            </select>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Serviços</h2>
                        <span>Selecione um ou mais serviços abaixo</span>
                    </legend>

                    <ul className="services-grid">
                        {services.map(service => (
                            <li
                                key={service.id}
                                onClick={() => handleSelectService(service.id)}
                                className={selectedServices.includes(service.id) ? 'selected' : ''}
                            >
                                <img src={service.image} alt={service.title} />
                                <span>{service.title}</span>
                            </li>
                        ))}
                    </ul>

                </fieldset>
                <button type="submit">Cadastrar ponto</button>
            </form>
        </div>
    )
}

export default CreatePoint;