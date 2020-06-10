import React, { useState, useEffect } from 'react';
import Constants from 'expo-constants';
import { Feather as Icon } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, Image, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { SvgUri } from 'react-native-svg';
import api from '../../services/api';
import * as Location from 'expo-location';


interface Service {
    id: number;
    title: string;
    image: string;
}

interface Point {
    id: number;
    name: string;
    image: string;
    latitude: number;
    longitude: number;

}

interface Params {
    uf: string;
    city: string;
}

const Points = () => {
    const navigation = useNavigation();
    const route = useRoute();

    const routeParams = route.params as Params;

    const [services, setServices] = useState<Service[]>([]);
    const [points, setPoints] = useState<Point[]>([]);
    const [selectedServices, setSelectedServices] = useState<number[]>([]);

    const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0]);

    useEffect(() => {
        async function loadPosition() {
            const { status } = await Location.requestPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert('Oooops...', 'Precisamos de sua permissão para obter a localização.');
                return;
            }

            const location = await Location.getCurrentPositionAsync();

            const { latitude, longitude } = location.coords;
            setInitialPosition([
                latitude,
                longitude
            ]);
        }
        loadPosition();
    }, [])

    useEffect(() => {
        api.get('services').then(response => {
            setServices(response.data);
            console.log(response.data);
        })
    }, []);

    useEffect(() => {
        api.get('points', {
            params: {
                city: routeParams.city,
                uf: routeParams.uf,
                services: selectedServices
            }
        }).then(response => {
            setPoints(response.data);
        })
    }, [selectedServices])

    function handleNavigateBack() {
        navigation.goBack();
    }

    function handleNavigateToDetail(id: number) {
        navigation.navigate('Detail', { point_id: id});
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

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.container}>
                <TouchableOpacity onPress={handleNavigateBack}>
                    <Icon name="arrow-left" size={20} color="#34cb79" />
                </TouchableOpacity>

                <Text style={styles.title}>Bem vindo.</Text>
                <Text style={styles.description}>Encontre no mapa um ponto maker.</Text>

                <View style={styles.mapContainer}>
                    {
                        initialPosition[0] !== 0 && (
                            <MapView
                                style={styles.map}
                                loadingEnabled={initialPosition[0] === 0}
                                initialRegion={{
                                    latitude: initialPosition[0],
                                    longitude: initialPosition[1],
                                    latitudeDelta: 0.014,
                                    longitudeDelta: 0.014
                                }}
                            >
                                {points.map(point => (
                                    <Marker
                                    key={String(point.id)}
                                        style={styles.mapMarker}
                                        onPress={() => handleNavigateToDetail(point.id)}
                                        coordinate={{
                                            latitude: point.latitude,
                                            longitude: point.longitude,
                                        }}
                                    >
                                        <View style={styles.mapMarkerContainer}>
                                            <Image style={styles.mapMarkerImage} source={{ uri: point.image }} />
                                            <Text style={styles.mapMarkerTitle}>{point.name}</Text>
                                        </View>

                                    </Marker>
                                ))}



                            </MapView>
                        )

                    }
                </View>
            </View>
            <View style={styles.servicesContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 20 }}
                >
                    {services.map(service => (
                        <TouchableOpacity
                            key={String(service.id)}
                            style={[
                                styles.service,
                                selectedServices.includes(service.id) ? styles.selectedService : {}
                            ]}
                            onPress={() => { handleSelectService(service.id) }}
                            activeOpacity={0.6}
                        >
                            <SvgUri width={44} height={44} uri={service.image} />
                            <Text style={styles.serviceTitle}>{service.title}</Text>
                        </TouchableOpacity>
                    ))}

                </ScrollView>
            </View>
        </SafeAreaView>
    )
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 32,
        paddingTop: 20 + Constants.statusBarHeight,
    },

    title: {
        fontSize: 20,
        fontFamily: 'Ubuntu_700Bold',
        marginTop: 24,
    },

    description: {
        color: '#6C6C80',
        fontSize: 16,
        marginTop: 4,
        fontFamily: 'Roboto_400Regular',
    },

    mapContainer: {
        flex: 1,
        width: '100%',
        borderRadius: 10,
        overflow: 'hidden',
        marginTop: 16,
    },

    map: {
        width: '100%',
        height: '100%',
    },

    mapMarker: {
        width: 90,
        height: 80,
    },

    mapMarkerContainer: {
        width: 90,
        height: 70,
        backgroundColor: '#34CB79',
        flexDirection: 'column',
        borderRadius: 8,
        overflow: 'hidden',
        alignItems: 'center'
    },

    mapMarkerImage: {
        width: 90,
        height: 45,
        resizeMode: 'cover',
    },

    mapMarkerTitle: {
        flex: 1,
        fontFamily: 'Roboto_400Regular',
        color: '#FFF',
        fontSize: 13,
        lineHeight: 23,
    },

    servicesContainer: {
        flexDirection: 'row',
        marginTop: 16,
        marginBottom: 32,
    },

    service: {
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#eee',
        height: 120,
        width: 120,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingTop: 20,
        paddingBottom: 16,
        marginRight: 8,
        alignItems: 'center',
        justifyContent: 'space-between',

        textAlign: 'center',
    },

    selectedService: {
        borderColor: '#34CB79',
        borderWidth: 2,
    },

    serviceTitle: {
        fontFamily: 'Roboto_400Regular',
        textAlign: 'center',
        fontSize: 13,
    },
});

export default Points;