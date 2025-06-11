/* eslint-disable */
import {AppDispatch, RootState} from '@/redux/store';
import {useTranslation} from 'react-i18next';
import {TypedUseSelectorHook, useDispatch, useSelector} from 'react-redux';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppTranslation = () => useTranslation().t;
export const useErrTranslation = () => useTranslation(['errors']).t;
