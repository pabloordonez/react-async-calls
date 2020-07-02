import React, { useEffect, useState } from 'react';
import './App.css';

class GithubStatusService
{
    baseUrl = 'https://kctbh9vrtdwd.statuspage.io/api/v2/';

    async summary()
    {
        return await this.get('summary.json');
    }

    async status()
    {
        return await this.get('status.json');
    }

    async incidents()
    {
        return await this.get('incidents.json');
    }

    async get(url)
    {
        const response = await fetch(`${this.baseUrl}/${url}`);
        return await response.json();
    }
}

function useAsyncCall(promiseFn)
{
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [content, setContent] = useState([]);

    useEffect(() =>
    {
        async function executeFunction()
        {
            try
            {
                setLoading(true);
                const result = await promiseFn();
                setContent(result);
            }
            catch (e)
            {
                setError(e);
            }
            finally
            {
                setLoading(false);
            }
        }

        executeFunction();
    }, [promiseFn]);

    return { loading, error, content };
}

function getDisplayName(WrappedComponent)
{
    return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

function withAsyncContent(Component, promiseFn)
{
    const WithAsyncContent = (...props) =>
    {
        const { loading, error, content } = useAsyncCall(promiseFn);

        if (loading)
            return props.loadingComponent || <div>Loading...</div>;

        if (error)
            return props.errorComponent || <div style={{ color: 'red' }}>{error.message}</div>;

        if (!content || content.length === 0)
            return props.noContentComponent || <div>There's no content</div>;

        return <Component content={content} {...props} />;
    };

    WithAsyncContent.displayName = `WithAsyncContent(${getDisplayName(Component)})`;
    return WithAsyncContent;
}

function IncidentList(props)
{
    return (
        <div>
            {props.content.incidents.map(x => (
                <div key={x.id}>
                    <span>{x.name}</span>(<span style={{ color: 'green' }}>{x.status}</span>)
                </div>
            ))}
        </div>
    );
}

// We needed to create the service call as an object here,
// because if not, the useEffect of the useAsyncCall will keep
// firing again and again.
const GithubStatus = new GithubStatusService();
const GetIncidents = async () => await GithubStatus.incidents();
const AsyncIncidentList = withAsyncContent(IncidentList, GetIncidents);

function App()
{
    return (
        <div className="App">
            <AsyncIncidentList />
        </div>
    );
}

export default App;