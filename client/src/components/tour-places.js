import '../styles/tour-places.css';
import { FaLocationDot,  FaRankingStar } from 'react-icons/fa6';
import { FaStar } from "react-icons/fa";
import { GoArrowRight, GoPersonFill } from "react-icons/go";

import { useEffect, useState, useRef, useCallback } from 'react';
import uuid from 'react-uuid';
import axios from 'axios';
import Data from '../JSON/tour-place.json';

const TourPlaces = () => {

    const [tourList, setTourList] = useState([]);
    const tourInput = useRef(null);
    const [searchTerm, setTerm] = useState('');
    const [request, setRequest] = useState(false);
    const [message, setMessage] = useState('Fetching data... Please wait a second!');

    const baseURL = window.location.href.includes('localhost:3000') ? 'http://localhost:3001' : "";
    const banner_url = "https://images.pexels.com/photos/861446/pexels-photo-861446.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1";
    const empty_url = "https://img.freepik.com/premium-vector/default-image-icon-vector-missing-picture-page-website-design-mobile-app-no-photo-available_87543-11093.jpg";

    const place_samples = Data;

    useEffect(() => {
        if (tourList.length === 0) {
            if (!sessionStorage.getItem('tour-place')) {
                apiRequest("Tokyo, Japan");
                console.log("API called!")
            }
            else {
                let sort = JSON.parse(sessionStorage.getItem('tour-place')).sort((a,b) => a.ranking_position - b.ranking_position);
                setTourList(sort);
            }
        }
        else {
            sortFilter();
        }
    }, [request]);

    const handleSort = (e) => {
        e.target?.classList.toggle('active');

        let filters = document.querySelectorAll('.sort-filter.active');
        filters.forEach(filter => {
            if (e.target.innerHTML.toLowerCase() !== filter.innerHTML.toLowerCase()) {
                filter?.classList.remove('active');
            }
        });
        
        sortFilter();
    }

    const sortFilter = () => {
        let sort = null;
        let filter = document.querySelector('.sort-filter.active');

        if (filter === null) { return; }

        if (filter.innerHTML === 'Ranking') {
            sort = tourList.sort((a,b) => a.ranking_position - b.ranking_position);
        }
        else if (filter.innerHTML === 'Rating') {
            sort = tourList.sort((a,b) => b.rating - a.rating);
        }
        else { sort = tourList.sort((a,b) => b.num_reviews - a.num_reviews); }
        
        setTourList([...sort]);
    }

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
        document.querySelector('.tour-search')?.classList.add('disabled');
        let input = document.getElementById('tour-search-input');
        input.disabled = true;

        await axios.post(baseURL + '/flight/locations-search/', {query: query})
        .then(async (response) => { 
            if (response.data[0] && response.data[0].result_object) {
                await axios.post(baseURL + '/flight/attractions-list/', 
                {
                    location_id: response.data[0].result_object.location_id
                })
                .then((response) => {
                    if (response.data.data && response.data.data.length > 0) {
                        let sort = response.data.data.filter(place => place.hasOwnProperty('photo') && place.hasOwnProperty('name'));
                        setTourList(sort);
                        setRequest(!request);
                    }
                    //console.log(response.data.data);
                    setTerm(tourInput.current.value);
                    if (!sessionStorage.getItem('tour-place')) {
                        sessionStorage.setItem('tour-place', JSON.stringify(response.data.data));
                    }
                }); 
            }
            else {
                setMessage('No results for this query at this level. Please be careful about spaces or spelling errors.');
            }
        });
        document.querySelector('.tour-search')?.classList.remove('disabled');
        input.disabled = false;
        
        scrollAnimation();
    }

    //const handleChange = (e) => { setInput(e.target.value); }

    const handleSubmit = async(e) => {
        e.preventDefault();

        if (tourInput.current.value.length > 0) {
            setTourList([]);
            apiRequest(tourInput.current.value);
        }
    };

    const handleToggleRead = (index) => {
        let previous = document.querySelectorAll('.tour-place-description.show');
        previous.forEach(d => {
            d?.classList.remove('show');
        })

        let description = document.querySelector('.tour-place-description-' + index);
        description?.classList.add('show');
    }

    const handleCloseRead = (index) => {
        let description = document.querySelector('.tour-place-description-' + index);
        description?.classList.remove('show');
    }

    return (
        <div className="tour-container flex">
            <div className='tour-banner'>
                <img className="tour-banner-image" src={banner_url} alt=""/>
                <div className='tour-banner-overlay'/>
                <form onSubmit={handleSubmit}  className="tour-search flex">
                    <input 
                        id='tour-search-input'
                        placeholder="Enter a city, district, or place"
                        ref={tourInput}
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

            <label className='tour-results-label flex'>
                {searchTerm.length <= 0 ?
                    <span>Example - Toyko, Japan</span>
                    :
                    <span>Search Results - {searchTerm}</span>
                }
            </label>

            <div className='sort-filters flex'>
                <label>Sort by: </label>
                <button className='sort-filter active ranking' onClick={handleSort}>Ranking</button>
                <button className='sort-filter rating' onClick={handleSort}>Rating</button>
                <button className='sort-filter reviews' onClick={handleSort}>Reviews</button>
            </div>

            {tourList.length === 0 &&
                <h1 className='tour-list-empty'>{message}</h1>
            }
        
            <div className="tour-list grid">
                {tourList.length > 0 &&
                    tourList.map((place, index) => 
                        <div className='tour-place flex' key={uuid()}>
                            <div className= {'tour-place-description flex ' + 'tour-place-description-' + index}>
                                <p>{place.description ? place.description : "Sorry. No Descriptions Available."}</p>
                                <div className='icon-wrapper flex'>
                                    <span onClick={() => {handleCloseRead(index)}}>EXIT</span>
                                    <GoArrowRight className='icon'/>
                                </div>
                            </div>
                            <img src={place.photo?.images.original.url ? place.photo.images.original.url : empty_url} alt={empty_url}/>
                            <div className='tour-place-footer flex'>
                                <div className='tour-place-name flex'>
                                    <FaLocationDot className='icon'/>
                                    <span>{place.name}</span>
                                </div>
                                <div className='tour-place-data flex'>
                                    <span className='tour-place-ranking flex'>
                                        <FaRankingStar className='icon'/>
                                        #{place.ranking_position}
                                    </span>
                                    <span className='separate-line'> | </span>
                                    <span className='tour-place-rating flex'>
                                        <FaStar className='icon'/> {place.rating}
                                    </span>
                                    <span className='separate-line'> | </span>
                                    <span className='tour-place-reviews flex'>
                                        <GoPersonFill className='icon'/> ({place.num_reviews})
                                    </span>
                                </div>
                                <button onClick={() => {handleToggleRead(index)}}>READ MORE</button>
                            </div>
                        </div> 
                    )
                }
            </div>

            <p>Powered by Travel Advisor API. This service aggregates places that are closed to the queried location.
                In addition, the places are supported by data to match the users preferences.
            </p>
        </div>
    )
}

export default TourPlaces;