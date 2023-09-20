import '../styles/tour-places.css';

import { useEffect, useState } from 'react';
import axios from 'axios';

import uuid from 'react-uuid';

const TourPlaces = () => {

    const [tourList, setTourList] = useState([]);
    const [tourInput, setInput] = useState('');
    const [searchTerm, setTerm] = useState('');

    const baseURL = window.location.href.includes('localhost:3000') ? 'http://localhost:3001' : "";

    useEffect(() => {
        if (tourList.length === 0) {
            apiRequest("Rome, Italy");
        }
    }, []);

    const apiRequest = async(query) => {
        await axios.post(baseURL + '/flight/locations-search/', {query: query})
        .then(async (response) => { 
            await axios.post(baseURL + '/flight/attractions-list/', 
            {
                location_id: response.data[0].result_object.location_id
            })
            .then((response) => {
                setTourList(response.data.data.filter(place => place.hasOwnProperty('photo') && place.hasOwnProperty('name')));
                setTerm(tourInput);
                setInput('');
            }); 
        });
    }

    const handleChange = (e) => {
        setInput(e.target.value);
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        if (tourInput.length > 0) {
            setTourList([]);
            apiRequest(tourInput);
        }
    }

    return (
        <div className="tour-container flex">
            <div className="tour-header flex">
                <h1>Browse Tour Attractions</h1>
                <span>
                    Enter a city, state, country, or etc. We will compile a list of popular attractions 
                    based around the query. Make new experiences and memories on your tour adventures.
                </span>
            </div>

            <div className="tour-search grid">
                <input 
                    placeholder="Enter a city, state, or country"
                    value={tourInput}
                    onChange={handleChange}
                />
                <button onClick={handleSubmit}>Search</button>
            </div>

            <label className='tour-results-label'>
                {searchTerm.length <= 0 ?
                    <span>Example - Italy's Hotspots</span>
                    :
                    <span>Search Results - {searchTerm}</span>
                }
            </label>

            <div className="tour-list grid">
                {tourList.length > 0 &&
                    tourList.map(place => 
                        <div className='tour-place' key={uuid()}>
                            <img src={place.photo.images.original.url} alt=""/>
                            <h1>{place.name}</h1>
                        </div> 
                    )
                }
            </div>
            {tourList.length === 0 &&
                <h1 className='tour-list-empty'>Fetching data... Please wait a second!</h1>
            }
        </div>
    )
}

export default TourPlaces;