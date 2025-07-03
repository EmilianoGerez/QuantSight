export type StockPrice = {
  symbol: string;
  date: Date;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  volume?: number;
};