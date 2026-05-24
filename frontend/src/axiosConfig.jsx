import axios from 'axios';

const axiosInstance = axios.create({
  // baseURL: 'http://localhost:5001', // local
  //baseURL: 'http://3.26.96.188:5001', // live
  baseURL: 'http://ifn636-ass2-group-3-alb-1947263770.ap-southeast-2.elb.amazonaws.com:5001', // ALB
  headers: { 'Content-Type': 'application/json' },
});

export default axiosInstance;
