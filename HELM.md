helm create otel-demo

rm -rf otel-demo/templates/*

helm template ./otel-demo
helm lint ./otel-demo


kind delete cluster --name otel-demo
kind create cluster --name otel-demo
helm repo add coralogix https://cgx.jfrog.io/artifactory/coralogix-charts-virtual
helm repo update
kubectl create namespace otel-demo 
kubectl create secret generic coralogix-keys --namespace otel-demo --from-literal=PRIVATE_KEY="cxtp_d9xB2ZbENpZwmnfELzjyJTzmFDe1Wa"
helm upgrade --install otel-coralogix-integration coralogix/otel-integration --version=0.0.205 --namespace otel-demo --render-subchart-notes -f ./values.yaml
helm install otel-demo ./otel-demo --namespace otel-demo --create-namespace
kubectl -n otel-demo get pod -A



