import { env } from '$env/dynamic/public';

if (env.PUBLIC_DISABLE_MSW !== 'true' && env.PUBLIC_MOCK_STUDENTVUE_ORIGIN === undefined)
	console.warn('PUBLIC_MOCK_STUDENTVUE_ORIGIN is not set but mocking is enabled');
