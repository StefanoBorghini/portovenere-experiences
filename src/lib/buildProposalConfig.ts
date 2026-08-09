export function buildProposalConfig(data: any[]) {

  const config: any = {};

  data.forEach((item) => {

    if (!config[item.section]) {

      config[item.section] = {};

    }

    config[item.section][item.key] =
      item.value;

  });

  return config;

}