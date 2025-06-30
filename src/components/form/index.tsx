// SPDX-FileCopyrightText: 2025 Istituto Nazionale di Fisica Nucleare
//
// SPDX-License-Identifier: EUPL-1.2

import React, { ForwardedRef } from "react";

export interface FormProps extends React.HTMLProps<HTMLFormElement> {}

const Form = React.forwardRef(function Form(
  props: FormProps,
  ref: ForwardedRef<HTMLFormElement>
) {
  const { children, ...formProps } = props;
  return (
    <form ref={ref} {...formProps}>
      {children}
    </form>
  );
});

export default Form;
