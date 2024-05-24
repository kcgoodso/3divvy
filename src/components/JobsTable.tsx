import { generateClient } from 'aws-amplify/data';
import { useAuthenticator } from '@aws-amplify/ui-react';
import type { Schema } from '../../amplify/data/resource';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Pagination } from '@aws-amplify/ui-react';
import { Link } from 'react-router-dom';
import {
    FormControlLabel,
    TextField,
    Box,
    Button,
    Checkbox,
    styled,
    Divider,
    IconButton,
    Table,
    TableContainer,
    TableBody,
    TableHead,
    TableRow,
    TableCell,
    TableFooter,
    TablePagination,
} from '@mui/material';
import { useEffect, useState } from 'react';

function formatDate(date_str) {
    let date = new Date(date_str);
    // Extract components from the date object
    let month = date.getMonth() + 1; // Months are zero-indexed
    let day = date.getDate();
    let year = date.getFullYear();
    let hours = date.getHours();
    let minutes = date.getMinutes();

    // Pad month, day, hours, and minutes with leading zeros if needed
    month = month < 10 ? '0' + month : month;
    day = day < 10 ? '0' + day : day;
    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;

    // Get the last two digits of the year
    year = year.toString().slice(-2);

    // Combine the components into the desired format
    return `${month}/${day}/${year} ${hours}:${minutes}`;
}


export default function JobsTable(props) {
    const filters = props.filters;
    const allowDelete = props.allowDelete ?? false;
    const allowEdit = props.allowEdit ?? false;
    const client = generateClient<Schema>();
    const { user, signOut } = useAuthenticator((context) => [context.user]);
    const [jobs, setJobs] = useState([]);
    const [pageTokens, setPageTokens] = useState([]);
    const [currentPageIndex, setCurrentPageIndex] = useState(1);
    const [hasMorePages, setHasMorePages] = useState(true);

    const fetchData = async (init, nextPage) => {
        if(init || (hasMorePages && currentPageIndex === pageTokens.length)) {
            const {data: new_jobs, nextToken} = await client.models.Job.list({
                filter: filters,
                limit: 30,
                nextToken: pageTokens[pageTokens.length - 1],
                authMode: 'userPool'
            });

            if(! nextToken) {
                setHasMorePages(false);
            }
            setPageTokens(init ? [nextToken] : [...pageTokens, nextToken]);
            if(init) {
                setJobs(new_jobs.length > 0 ? [new_jobs] : []);
            } else if(new_jobs.length > 0) {
                setJobs([...jobs, new_jobs]);
            }
        }

        if(nextPage) {
            setCurrentPageIndex((pi) => pi + 1);
        }
    }

    useEffect(() => { fetchData(true, false); }, [props.filters]);

    if(jobs.length === 0) {
        return (<p>No jobs matching criteria.</p>);
    }

    return (
    <>
    <TableContainer>
        <Table>
        <TableHead>
            <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Time Created</TableCell>
                <TableCell>Amount Offered ($)</TableCell>
                <TableCell>Description</TableCell>
                { props.allowEdit   ? <TableCell></TableCell> : null }
                { props.allowDelete ? <TableCell></TableCell> : null }
            </TableRow>
        </TableHead>
        <TableBody>
        {jobs[currentPageIndex - 1].map((job) => {
            return (
            <TableRow key={job['id']}>
                <TableCell>{job['title']}</TableCell>
                <TableCell>{formatDate(job['createdAt'])}</TableCell>
                <TableCell>{job['amountOffered']}</TableCell>
                <TableCell>{job['description']}</TableCell>
                { props.allowEdit ?
                    (<TableCell>
                        <Link to={`/home/editJob/${job['id']}`}>
                            <FontAwesomeIcon icon={faEdit} />
                        </Link>
                    </TableCell>) : null
                }
                { props.allowDelete ?
                    (<TableCell>
                        <Link to={`/home/deleteJob/${job['id']}`}>
                            <FontAwesomeIcon icon={faTrash} />
                        </Link>
                    </TableCell>) : null
                }
            </TableRow>);
        })}
        </TableBody>
        </Table>
    </TableContainer>
    <Pagination
        currentPage={currentPageIndex}
        totalPages={pageTokens.length}
        hasMorePages={hasMorePages}
        onPrevious={() => setCurrentPageIndex(currentPageIndex - 1)}
        onNext={() => fetchData(false, true)}
        onChange={(pageIndex) => setCurrentPageIndex(pageIndex)}
    />
    </>
    );
}
