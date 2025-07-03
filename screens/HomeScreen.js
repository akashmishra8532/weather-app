import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, ImageBackground, ScrollView, RefreshControl } from 'react-native';
import * as Location from 'expo-location';
import axios from 'axios';
import WeatherCard from '../components/WeatherCard';
import ForecastList from '../components/ForecastList';
import { fetchWeather } from '../utils/fetchWeather';
import { fetchForecast } from '../utils/fetchForecast';

const apikey = "52b4b30e80ea54992a38162219caba8f";

export default function HomeScreen() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    getLocationWeather();
  }, []);

  const getLocationWeather = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission denied for location access.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apikey}&units=metric`
      );

      setWeather(response.data);
      const cityName = response.data.name;
      const forecastData = await fetchForecast(cityName);
      setForecast(forecastData);
    } catch (error) {
      console.error(error);
      alert('Error getting weather from location.');
    }
  };

  const handleSearch = async () => {
    if (!city) return;
    setLoading(true);
    try {
      const data = await fetchWeather(city);
      setWeather(data);
      const forecastData = await fetchForecast(city);
      setForecast(forecastData);
    } catch (err) {
      alert('City not found!');
    }
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await getLocationWeather();
    setRefreshing(false);
  };

  const getBackgroundImage = () => {
    if (!weather) return require('../assets/sunny.jpg');
    const main = weather.weather[0].main.toLowerCase();
    if (main.includes('rain')) return require('../assets/rainy.jpg');
    if (main.includes('cloud')) return require('../assets/cloudy.jpg');
    return require('../assets/sunny.jpg');
  };

  return (
    <ImageBackground source={getBackgroundImage()} style={{ flex: 1 }} resizeMode="cover">
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        <View style={styles.container}>
          <Text style={styles.title}>Weather App</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter city"
            value={city}
            onChangeText={setCity}
          />
          <TouchableOpacity style={styles.button} onPress={handleSearch}>
            <Text style={styles.buttonText}>Search</Text>
          </TouchableOpacity>
          {loading && <ActivityIndicator size="large" color="#0000ff" />}
          {weather && <WeatherCard weather={weather} />}
          {forecast && <ForecastList forecast={forecast} />}
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'flex-start', // Start from the top
      alignItems: 'center',
      padding: 20,
      paddingTop: 60,
    },
    title: {
      fontSize: 36,
      fontWeight: 'bold',
      marginBottom: 20,
      color: '#000', // Dark blue
      textShadowColor: 'rgba(0, 0, 0, 0.1)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 2,
    },
    input: {
      width: '100%',
      borderWidth: 1,
      borderColor: '#d1d5db', // Light gray border
      padding: 14,
      marginBottom: 20,
      borderRadius: 12,
      backgroundColor: '#f9fafb', // Light background
      textAlign: 'center',
      fontSize: 16,
      color: '#111827',
      elevation: 3,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
    },
    button: {
      backgroundColor: '#3b82f6', // Bright blue
      paddingVertical: 14,
      paddingHorizontal: 28,
      borderRadius: 12,
      elevation: 4,
      shadowColor: '#000',
      shadowOpacity: 0.15,
      shadowRadius: 5,
      shadowOffset: { width: 0, height: 3 },
    },
    buttonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: '600',
    },
  });
  
