helm create otel-demo

rm -rf otel-demo/templates/*

helm template ./otel-demo
helm lint ./otel-demo


kind delete cluster --name otel-demo
kind create cluster --name otel-demo
helm install otel-demo ./otel-demo --namespace otel-demo --create-namespace
kubectl -n otel-demo get pod -A
