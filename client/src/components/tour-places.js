import '../styles/tour-places.css';
import { FaLocationDot } from 'react-icons/fa6';

import { useEffect, useState } from 'react';
import axios from 'axios';

import uuid from 'react-uuid';

const TourPlaces = () => {

    const [tourList, setTourList] = useState([]);
    const [tourInput, setInput] = useState('');
    const [searchTerm, setTerm] = useState('');
    const [message, setMessage] = useState('Fetching data... Please wait a second!');

    const baseURL = window.location.href.includes('localhost:3000') ? 'http://localhost:3001' : "";
    const banner_url = "https://images.pexels.com/photos/2359/sand-desert-statue-pyramid.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1";

    useEffect(() => {
        apiRequest("Rome, Italy")
    }, []);

    const scrollAnimation = () => {
        setTimeout(() => {
            let main_banner = document.querySelector('.main-banner');
            let tour_header = document.querySelector('.tour-header');
            let tour_results = document.querySelector('.tour-results-label');

            let scrollY = 
                main_banner?.getBoundingClientRect().height + 
                tour_header?.getBoundingClientRect().height + 
                tour_results?.getBoundingClientRect().height;
                
            window?.scrollTo({top: scrollY, behavior: 'smooth'});
        }, 500);
    }

    const apiRequest = async (query) => {
        await axios.post(baseURL + '/flight/locations-search/', {query: query})
        .then(async (response) => { 
            await axios.post(baseURL + '/flight/attractions-list/', 
            {
                location_id: response.data[0].result_object.location_id
            })
            .then((response) => {
                if (response.data.data) {
                    setTourList(response.data.data.filter(place => place.hasOwnProperty('photo') && place.hasOwnProperty('name')));
                }
                else {
                    setMessage('No results for this query at this level. Please try another key search.');
                }
                setTerm(tourInput);
            }); 
        });
        scrollAnimation();
    }

    const handleChange = (e) => { setInput(e.target.value); }

    const handleSubmit = (e) => {
        e.preventDefault();
        if (tourInput.length > 0) {
            setTourList([]);
            apiRequest(tourInput);
        }
    }

    return (
        <div className="tour-container flex">
            <div className='tour-banner'>
                <img className="tour-banner-image" src={banner_url} alt=""/>
                <div className='tour-banner-overlay'/>
                <form onSubmit={handleSubmit} className="tour-search flex">
                    <input 
                        placeholder="Enter a city, district, or place"
                        value={tourInput}
                        onChange={handleChange}
                    />
                    <div className="tour-header flex">
                        <h1>Browse Tour Attractions</h1>
                        <span>
                            Enter cities, districts, places, or more. We will compile a list of popular attractions 
                            based around the query. Make new experiences and memories on your tour adventures.
                        </span>
                    </div>
                </form>
            </div>

            <label className='tour-results-label'>
                {searchTerm.length <= 0 ?
                    <span>Example - Italy's Hotspots</span>
                    :
                    <span>Search Results - {searchTerm}</span>
                }
            </label>

            {tourList.length === 0 &&
                <h1 className='tour-list-empty'>{message}</h1>
            }
        
            <div className="tour-list grid">
                {tourList.length > 0 &&
                    tourList.map(place => 
                        <div className='tour-place flex' key={uuid()}>
                            <img src={place.photo.images.original.url} alt=""/>
                            <div className='tour-place-footer flex'>
                                <div className='icon-wrapper flex'><FaLocationDot className='icon'/></div>
                                <h1>{place.name}</h1>
                            </div>
                        </div> 
                    )
                }
            </div>
        </div>
    )
}

export default TourPlaces;