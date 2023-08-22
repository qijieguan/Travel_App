import '../styles/date-pickers.css';

import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers';
import { useState } from 'react';

const DatePickers = ({ setDateInput }) => {

    const today = dayjs();

    const [depart_date, setDepartDate] = useState(null);
    const [return_date, setReturnDate] = useState(null);

    const handleSelect = (date, type) => {
        if (type === 'depart') {
            setDepartDate(date); 
            if (return_date) {
                if ((new Date(return_date) - new Date(date)) < 0) {
                    setReturnDate(null);
                    setDateInput({type: 'return', date: null})
                }
            }
            setDateInput({type: 'depart', date: date.$d})
        }
        else {
            setReturnDate(date); 
            setDateInput({type: 'return', date: date.$d})
        }
    }

    return (
        <div className='date-pickers grid'>
            <div className='date-picker-wrapper flex'>
                <span>Departure</span>
                <DatePicker className='date-picker depart' value={depart_date} 
                    minDate={today}
                    onChange={(depart_date) => { handleSelect(depart_date, 'depart') }}
                />
            </div>  
            <div className='date-picker-wrapper flex'>
                <span>Return</span>
                <DatePicker className='date-picker return' value={return_date} 
                    minDate={depart_date !== null ? depart_date : today}
                    onChange={(return_date) => { handleSelect(return_date, 'return') }}
                />
            </div>  
        </div>
    )
}

export default DatePickers;